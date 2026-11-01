const crypto = require("crypto");
const fs = require("fs/promises");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");

const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
  ConflictRequestError,
  InternalServerError,
  TooManyRequestsError,
} = require("../core/error.response");
const { OK, Created } = require("../core/success.response");
const statusCodes = require("../core/statusCodes");

const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const productModel = require("../models/product.model");
require("../models/category.model"); // đăng ký model "category" để populate

const {
  createAccessToken,
  createRefreshToken,
  verifyToken,
} = require("../auth/checkAuth");
const cloudinary = require("../config/Cloudinary");
const getPublicId = require("../utils/getPublicId");
const searchAddress = require("../utils/searchAddress");
const SendMailForgotPassword = require("../utils/mailForgotPassword");
const SendMailVerifyAccount = require("../utils/mailVerifyAccount");

require("dotenv").config();

/* ======================================================================
 * CẤU HÌNH
 * ==================================================================== */
const IS_PROD = process.env.NODE_ENV === "production";
// Đặt REQUIRE_EMAIL_VERIFY=false trong .env nếu client chưa có màn hình nhập OTP xác thực
const REQUIRE_EMAIL_VERIFY = process.env.REQUIRE_EMAIL_VERIFY !== "false";

const DAY = 24 * 60 * 60 * 1000;
const COOKIE_MAX_AGE = 30 * DAY; // = hạn của refresh token (xem giải thích ở setAuthCookies)
const STEP_TOKEN_TTL = "15m"; // cookie phiên xác thực / quên mật khẩu

const OTP_MAX_ATTEMPTS = 5; // sai quá 5 lần phải lấy OTP mới
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60s giữa 2 lần gửi OTP
const MAX_SESSIONS = 5; // tối đa 5 thiết bị đăng nhập cùng lúc
const MAX_ADDRESSES = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const OTP_TYPE = {
  VERIFY_ACCOUNT: "verifyAccount",
  FORGOT_PASSWORD: "forgotPassword",
};
const STEP_COOKIE = {
  [OTP_TYPE.VERIFY_ACCOUNT]: "tokenVerifyAccount",
  [OTP_TYPE.FORGOT_PASSWORD]: "tokenForgotPassword",
};

/* ======================================================================
 * HÀM TIỆN ÍCH: VALIDATE
 * (Luôn ép kiểu về string để chặn NoSQL injection kiểu { "email": { "$ne": "" } })
 * ==================================================================== */
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const normalizeEmail = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function assertEmail(email) {
  if (!email || email.length > 100 || !EMAIL_REGEX.test(email)) {
    throw new BadRequestError("Email không hợp lệ");
  }
}

function assertPassword(password) {
  if (typeof password !== "string" || password.length < 6 || password.length > 50) {
    throw new BadRequestError("Mật khẩu phải từ 6 đến 50 ký tự");
  }
}

function assertPhone(phone) {
  if (!PHONE_REGEX.test(String(phone))) {
    throw new BadRequestError("Số điện thoại phải gồm đúng 10 chữ số");
  }
}

function assertOtp(otp) {
  if (!/^[0-9]{6}$/.test(String(otp ?? ""))) {
    throw new BadRequestError("Mã OTP phải gồm 6 chữ số");
  }
}

function assertObjectId(id, label = "ID") {
  if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
    throw new BadRequestError(`${label} không hợp lệ`);
  }
}

function validateAddress(data) {
  const fullName = typeof data?.fullName === "string" ? data.fullName.trim() : "";
  const phone = data?.phone !== undefined ? String(data.phone).trim() : "";
  const address = typeof data?.address === "string" ? data.address.trim() : "";

  if (!fullName || fullName.length > 100) {
    throw new BadRequestError("Vui lòng nhập họ tên người nhận");
  }
  assertPhone(phone);
  if (!address || address.length > 300) {
    throw new BadRequestError("Vui lòng nhập địa chỉ giao hàng");
  }
  return { fullName, phone, address };
}

/* ======================================================================
 * HÀM TIỆN ÍCH: USER / COOKIE / TOKEN
 * ==================================================================== */

// Không bao giờ trả password / refreshToken về client
function sanitizeUser(user) {
  const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
}

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const cookieOptions = (maxAge, httpOnly = true) => ({
  httpOnly,
  secure: IS_PROD, // dev (http://localhost) thì tắt, production (https) thì bật
  sameSite: "strict",
  maxAge,
});
const clearOptions = (httpOnly = true) => ({
  httpOnly,
  secure: IS_PROD,
  sameSite: "strict",
});

/**
 * Lưu ý quan trọng: middleware authUser coi "có cookie logged mà không có cookie accessToken"
 * là bất thường và xóa sạch cookie (kể cả refreshToken).
 * Vì vậy cookie accessToken sống bằng cookie logged (30 ngày), còn việc "hết hạn" do
 * chính JWT quyết định (1 ngày). Khi JWT hết hạn -> middleware trả 401 -> client gọi
 * /refresh-token để lấy access token mới.
 */
function setAccessCookies(res, accessToken) {
  res.cookie("accessToken", accessToken, cookieOptions(COOKIE_MAX_AGE));
  res.cookie("logged", 1, cookieOptions(COOKIE_MAX_AGE, false)); // client (js-cookie) cần đọc
}

function setAuthCookies(res, accessToken, refreshToken) {
  setAccessCookies(res, accessToken);
  res.cookie("refreshToken", refreshToken, cookieOptions(COOKIE_MAX_AGE));
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", clearOptions());
  res.clearCookie("refreshToken", clearOptions());
  res.clearCookie("logged", clearOptions(false));
}

// Tạo phiên đăng nhập: cấp token, lưu hash refresh token vào DB (để thu hồi được), set cookie
async function startSession(res, user) {
  const accessToken = createAccessToken({ id: user._id });
  const refreshToken = createRefreshToken({
    id: user._id,
    type: "refresh",
    jti: crypto.randomUUID(),
  });

  await userModel.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshToken: { $each: [hashToken(refreshToken)], $slice: -MAX_SESSIONS },
      },
      $set: { lastOnline: new Date() },
    },
  );

  setAuthCookies(res, accessToken, refreshToken);
}

/* ======================================================================
 * HÀM TIỆN ÍCH: OTP + COOKIE PHIÊN (verify account / quên mật khẩu)
 * ==================================================================== */

// Cookie "bước tiếp theo": chứa email đã ký JWT + mục đích, để các API verify biết là của ai
function setStepCookie(res, type, email) {
  const token = jwt.sign({ email, purpose: type }, process.env.JWT_SECRET, {
    expiresIn: STEP_TOKEN_TTL,
  });
  res.cookie(STEP_COOKIE[type], token, cookieOptions(15 * 60 * 1000));
}

function readStepCookie(req, type) {
  const token = req.cookies?.[STEP_COOKIE[type]];
  if (!token) {
    throw new BadRequestError("Phiên đã hết hạn, vui lòng gửi lại yêu cầu");
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new BadRequestError("Phiên đã hết hạn, vui lòng gửi lại yêu cầu");
  }
  // purpose chặn việc dùng nhầm access/refresh token (cùng JWT_SECRET) làm token OTP
  if (decoded.purpose !== type || !decoded.email) {
    throw new BadRequestError("Phiên không hợp lệ, vui lòng gửi lại yêu cầu");
  }
  return decoded.email;
}

// Sinh OTP 6 số bằng CSPRNG, lưu bản hash, mỗi (email, type) chỉ giữ 1 OTP hiệu lực
async function createOtp(email, type) {
  const last = await otpModel
    .findOne({ email, type })
    .sort({ createdAt: -1 })
    .select("createdAt");
  if (last) {
    const wait = OTP_RESEND_COOLDOWN_MS - (Date.now() - last.createdAt.getTime());
    if (wait > 0) {
      throw new TooManyRequestsError(
        `Vui lòng đợi ${Math.ceil(wait / 1000)} giây trước khi yêu cầu mã mới`,
      );
    }
  }

  const otp = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  await otpModel.deleteMany({ email, type });
  await otpModel.create({ email, type, otp: await bcrypt.hash(otp, 10) });
  return otp;
}

async function sendOtp(email, type) {
  const otp = await createOtp(email, type);
  try {
    if (type === OTP_TYPE.VERIFY_ACCOUNT) {
      await SendMailVerifyAccount(email, otp);
    } else {
      await SendMailForgotPassword(email, otp);
    }
  } catch (error) {
    await otpModel.deleteMany({ email, type });
    console.error("Gửi email OTP thất bại:", error.message);
    throw new InternalServerError("Không thể gửi email lúc này, vui lòng thử lại sau");
  }
}

// Kiểm tra OTP. Tăng số lần thử TRƯỚC khi so sánh (atomic) để chặn dò OTP song song.
async function consumeOtp(email, type, otp) {
  assertOtp(otp);
  const record = await otpModel.findOneAndUpdate(
    {
      email,
      type,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: OTP_MAX_ATTEMPTS },
    },
    { $inc: { attempts: 1 } },
    { sort: { createdAt: -1 }, returnDocument: "after" },
  );
  if (!record) {
    throw new BadRequestError("OTP không hợp lệ hoặc đã hết hạn, vui lòng lấy mã mới");
  }
  const isMatch = await bcrypt.compare(String(otp), record.otp);
  if (!isMatch) {
    throw new BadRequestError("Mã OTP không đúng");
  }
  await otpModel.deleteMany({ email, type });
}

/* ======================================================================
 * GOOGLE OAUTH
 * ==================================================================== */
let googleClient;
function getGoogleClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new InternalServerError("Google OAuth chưa được cấu hình");
  }
  googleClient ??= new google.auth.OAuth2(clientId);
  return googleClient;
}

/* ======================================================================
 * CONTROLLER
 * ==================================================================== */
class UserController {
  /* ------------------------------ ĐĂNG KÝ ------------------------------ */
  async register(req, res) {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const phone = req.body.phone ? String(req.body.phone).trim() : "";

    if (!fullName || fullName.length > 100) {
      throw new BadRequestError("Vui lòng nhập họ tên hợp lệ");
    }
    assertEmail(email);
    assertPassword(password);
    if (phone) assertPhone(phone);

    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await userModel.findOne({ email });

    if (user) {
      // Email đã dùng thật -> báo trùng
      if (user.isActive || user.typeLogin === "google" || !REQUIRE_EMAIL_VERIFY) {
        throw new ConflictRequestError("Email đã tồn tại");
      }
      // Đăng ký dở dang (chưa xác thực): GHI ĐÈ thông tin bằng lần đăng ký mới nhất.
      // Nếu không, kẻ xấu đăng ký trước bằng email của người khác với mật khẩu của hắn,
      // rồi người thật xác thực OTP -> tài khoản đã kích hoạt nhưng mật khẩu là của kẻ xấu.
      user.fullName = fullName;
      user.password = hashedPassword;
      user.phone = phone;
      await user.save();
    } else {
      try {
        user = await userModel.create({
          fullName,
          email,
          password: hashedPassword,
          phone,
          typeLogin: "email",
          isActive: !REQUIRE_EMAIL_VERIFY,
          // KHÔNG nhận isAdmin từ body: bản cũ cho phép ai cũng tự đăng ký làm admin
        });
      } catch (error) {
        if (error.code === 11000) throw new ConflictRequestError("Email đã tồn tại");
        throw error;
      }
    }

    if (!REQUIRE_EMAIL_VERIFY) {
      return new Created({
        message: "Đăng ký thành công",
        metadata: { requireVerify: false },
      }).send(res);
    }

    setStepCookie(res, OTP_TYPE.VERIFY_ACCOUNT, email);
    await sendOtp(email, OTP_TYPE.VERIFY_ACCOUNT);

    return new Created({
      message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản",
      metadata: { requireVerify: true, email },
    }).send(res);
  }

  /* --------------------------- XÁC THỰC TÀI KHOẢN --------------------------- */
  async verifyAccount(req, res) {
    const email = readStepCookie(req, OTP_TYPE.VERIFY_ACCOUNT);

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundError("Người dùng không tồn tại");
    if (user.isBlocked) throw new ForbiddenError("Tài khoản của bạn đã bị khóa");
    if (user.isActive) throw new BadRequestError("Tài khoản đã được xác thực trước đó");

    await consumeOtp(email, OTP_TYPE.VERIFY_ACCOUNT, req.body.otp);

    await userModel.updateOne({ _id: user._id }, { $set: { isActive: true } });
    res.clearCookie(STEP_COOKIE[OTP_TYPE.VERIFY_ACCOUNT], clearOptions());

    await startSession(res, user); // xác thực xong đăng nhập luôn

    return new OK({
      message: "Xác thực tài khoản thành công",
      metadata: { user: sanitizeUser({ ...user.toObject(), isActive: true }) },
    }).send(res);
  }

  async resendVerifyOtp(req, res) {
    const email = readStepCookie(req, OTP_TYPE.VERIFY_ACCOUNT);

    const user = await userModel.findOne({ email });
    if (!user || user.isActive) {
      throw new BadRequestError("Không thể gửi lại mã cho tài khoản này");
    }
    await sendOtp(email, OTP_TYPE.VERIFY_ACCOUNT);

    return new OK({
      message: "Đã gửi lại mã OTP, vui lòng kiểm tra email",
      metadata: true,
    }).send(res);
  }

  /* ------------------------------ ĐĂNG NHẬP ------------------------------ */
  async login(req, res) {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || typeof password !== "string" || !password) {
      throw new BadRequestError("Vui lòng nhập email và mật khẩu");
    }

    const INVALID = "Tài khoản hoặc mật khẩu không chính xác";
    const user = await userModel.findOne({ email }).select("+password");
    // Cùng một thông báo cho "sai email" và "sai mật khẩu" để không lộ email nào đã đăng ký
    if (!user) throw new AuthFailureError(INVALID);

    if (!user.password) {
      throw new AuthFailureError("Tài khoản này đăng nhập bằng Google");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AuthFailureError(INVALID);

    if (user.isBlocked) throw new ForbiddenError("Tài khoản của bạn đã bị khóa");

    // Đúng mật khẩu nhưng chưa xác thực email -> gửi OTP để xác thực
    if (!user.isActive) {
      setStepCookie(res, OTP_TYPE.VERIFY_ACCOUNT, email);
      await sendOtp(email, OTP_TYPE.VERIFY_ACCOUNT);
      return res.status(statusCodes.FORBIDDEN).json({
        success: false,
        message: "Tài khoản chưa được xác thực, mã OTP đã được gửi tới email của bạn",
        metadata: { requireVerify: true, email },
      });
    }

    await startSession(res, user);

    return new OK({
      message: "Đăng nhập thành công",
      metadata: { user: sanitizeUser(user) }, // không trả token trong body (đã có httpOnly cookie)
    }).send(res);
  }

  async loginGoogle(req, res) {
    const { tokenGoogle } = req.body;
    if (!isNonEmptyString(tokenGoogle)) {
      throw new BadRequestError("Thiếu token Google");
    }

    const client = getGoogleClient();
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: tokenGoogle,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      throw new AuthFailureError("Token Google không hợp lệ hoặc đã hết hạn");
    }

    const email = normalizeEmail(payload?.email);
    if (!email || !payload.email_verified) {
      throw new AuthFailureError("Email Google chưa được xác minh");
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        fullName: payload.name || email.split("@")[0],
        email,
        avatar: payload.picture || "",
        isActive: true,
        typeLogin: "google",
      });
    } else {
      if (user.isBlocked) throw new ForbiddenError("Tài khoản của bạn đã bị khóa");

      if (!user.isActive) {
        // Tài khoản đăng ký email nhưng chưa xác thực: Google đã chứng minh chủ email,
        // nên kích hoạt và XÓA mật khẩu cũ (có thể do người khác đăng ký trước bằng email này).
        user = await userModel.findOneAndUpdate(
          { _id: user._id },
          {
            $set: {
              isActive: true,
              typeLogin: "google",
              avatar: user.avatar || payload.picture || "",
            },
            $unset: { password: 1 },
          },
          { returnDocument: "after" },
        );
      } else if (!user.avatar && payload.picture) {
        user.avatar = payload.picture;
        await userModel.updateOne({ _id: user._id }, { $set: { avatar: payload.picture } });
      }
    }

    await startSession(res, user);

    return new OK({
      message: "Đăng nhập thành công",
      metadata: { user: sanitizeUser(user) },
    }).send(res);
  }

  /* --------------------------- THÔNG TIN / ĐĂNG XUẤT --------------------------- */
  async getAuth(req, res) {
    return new OK({
      message: "Xác thực thành công",
      metadata: { userId: req.user },
    }).send(res);
  }

  async authUser(req, res) {
    const user = await userModel.findById(req.user).select("-password -refreshToken");
    if (!user) {
      clearAuthCookies(res);
      throw new NotFoundError("Người dùng không tồn tại");
    }
    if (user.isBlocked) {
      clearAuthCookies(res);
      throw new ForbiddenError("Tài khoản của bạn đã bị khóa");
    }

    return new OK({
      message: "Xác thực người dùng thành công",
      metadata: { user },
    }).send(res);
  }

  // Route logout KHÔNG đặt authUser: access token hết hạn vẫn phải đăng xuất được.
  async logout(req, res) {
    const token = req.cookies?.refreshToken;
    if (token) {
      // decode (không verify) vẫn an toàn: $pull chỉ có tác dụng nếu hash khớp đúng token đó
      const decoded = jwt.decode(token);
      if (decoded?.id && mongoose.isValidObjectId(decoded.id)) {
        await userModel.updateOne(
          { _id: decoded.id },
          { $pull: { refreshToken: hashToken(token) } },
        );
      }
    }
    clearAuthCookies(res);

    return new OK({ message: "Đăng xuất thành công", metadata: true }).send(res);
  }

  async refreshToken(req, res) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AuthFailureError("Vui lòng đăng nhập lại");

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      throw new AuthFailureError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    }
    if (decoded.type !== "refresh" || !decoded.id) {
      throw new AuthFailureError("Phiên đăng nhập không hợp lệ");
    }

    // Refresh token phải còn trong DB (đăng xuất / đổi mật khẩu / khóa tài khoản sẽ xóa nó)
    const user = await userModel
      .findOne({ _id: decoded.id, refreshToken: hashToken(token) })
      .select("isBlocked");
    if (!user) throw new AuthFailureError("Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại");
    if (user.isBlocked) throw new ForbiddenError("Tài khoản của bạn đã bị khóa");

    setAccessCookies(res, createAccessToken({ id: user._id }));

    return new OK({ message: "Refresh token thành công", metadata: true }).send(res);
  }

  /* ----------------------------- QUÊN / ĐỔI MẬT KHẨU ----------------------------- */
  async forgotPassword(req, res) {
    const email = normalizeEmail(req.body.email);
    if (!email) throw new BadRequestError("Vui lòng nhập email");
    assertEmail(email);

    // Luôn set cookie và trả cùng một thông báo dù email có tồn tại hay không (chống dò email)
    setStepCookie(res, OTP_TYPE.FORGOT_PASSWORD, email);

    const user = await userModel.findOne({ email }).select("+password isBlocked");
    if (user && user.password && !user.isBlocked) {
      await sendOtp(email, OTP_TYPE.FORGOT_PASSWORD);
    }

    return new OK({
      message: "Nếu email tồn tại, mã OTP đã được gửi đến email của bạn",
      metadata: true,
    }).send(res);
  }

  async verifyForgotPassword(req, res) {
    // (Bản cũ console.log cả body và cookies -> lộ mật khẩu vào log, đã bỏ)
    const email = readStepCookie(req, OTP_TYPE.FORGOT_PASSWORD);
    const { otp, password } = req.body;
    assertPassword(password);

    await consumeOtp(email, OTP_TYPE.FORGOT_PASSWORD, otp);

    const hashedPassword = await bcrypt.hash(password, 10);
    // Đổi mật khẩu xong: thu hồi toàn bộ phiên cũ; có OTP từ email nghĩa là đã chứng minh chủ email
    const result = await userModel.updateOne(
      { email },
      { $set: { password: hashedPassword, isActive: true, refreshToken: [] } },
    );
    if (result.matchedCount === 0) {
      throw new BadRequestError("Mã OTP không hợp lệ hoặc đã hết hạn");
    }

    res.clearCookie(STEP_COOKIE[OTP_TYPE.FORGOT_PASSWORD], clearOptions());
    clearAuthCookies(res);

    return new OK({ message: "Khôi phục mật khẩu thành công", metadata: true }).send(res);
  }

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    if (typeof oldPassword !== "string" || !oldPassword) {
      throw new BadRequestError("Vui lòng nhập mật khẩu hiện tại");
    }
    assertPassword(newPassword);
    if (oldPassword === newPassword) {
      throw new BadRequestError("Mật khẩu mới phải khác mật khẩu hiện tại");
    }

    const user = await userModel.findById(req.user).select("+password");
    if (!user) throw new NotFoundError("Người dùng không tồn tại");
    if (!user.password) {
      throw new BadRequestError("Tài khoản Google không có mật khẩu để đổi");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new AuthFailureError("Mật khẩu hiện tại không chính xác");

    await userModel.updateOne(
      { _id: user._id },
      { $set: { password: await bcrypt.hash(newPassword, 10), refreshToken: [] } },
    );
    await startSession(res, user); // thu hồi các thiết bị khác, giữ phiên hiện tại

    return new OK({ message: "Đổi mật khẩu thành công", metadata: true }).send(res);
  }

  /* ------------------------------ HỒ SƠ CÁ NHÂN ------------------------------ */
  async editUser(req, res) {
    const file = req.file;
    try {
      const user = await userModel.findById(req.user);
      if (!user) throw new NotFoundError("Người dùng không tồn tại");

      const { fullName, phone } = req.body;
      const updates = {};

      if (fullName !== undefined) {
        if (!isNonEmptyString(fullName) || fullName.trim().length > 100) {
          throw new BadRequestError("Họ tên không hợp lệ");
        }
        updates.fullName = fullName.trim();
      }
      if (phone !== undefined && phone !== "") {
        assertPhone(phone);
        updates.phone = String(phone).trim();
      }

      const oldAvatar = user.avatar;
      if (file) {
        const { secure_url } = await cloudinary.uploader.upload(file.path, {
          folder: "avatars",
          resource_type: "image",
        });
        updates.avatar = secure_url;
      }

      if (Object.keys(updates).length === 0) {
        throw new BadRequestError("Không có thông tin nào để cập nhật");
      }

      // Chỉ cho sửa fullName / phone / avatar -> không thể tự nâng quyền isAdmin, đổi email, ...
      const updatedUser = await userModel
        .findByIdAndUpdate(
          user._id,
          { $set: updates },
          { returnDocument: "after", runValidators: true },
        )
        .select("-password -refreshToken");

      // Xóa avatar cũ trên Cloudinary (bỏ qua ảnh từ Google vì không phải của mình)
      if (file && oldAvatar?.includes("res.cloudinary.com")) {
        try {
          await cloudinary.uploader.destroy(getPublicId(oldAvatar));
        } catch (error) {
          console.warn("Không thể xóa avatar cũ:", error.message);
        }
      }

      return new OK({
        message: "Cập nhật thông tin thành công",
        metadata: { user: updatedUser },
      }).send(res);
    } finally {
      // File tạm do multer lưu ở ổ đĩa: luôn dọn dù thành công hay lỗi
      if (file?.path) await fs.unlink(file.path).catch(() => {});
    }
  }

  async searchAddress(req, res) {
    const { address } = req.query;
    if (!isNonEmptyString(address)) {
      throw new BadRequestError("Vui lòng nhập địa chỉ cần tìm");
    }
    const result = await searchAddress(address.trim());

    return new OK({ message: "Tìm kiếm địa chỉ thành công", metadata: result }).send(res);
  }

  /* ------------------------------ ĐỊA CHỈ GIAO HÀNG ------------------------------ */
  async createAddress(req, res) {
    // Hỗ trợ cả { data: {...} } (kiểu book-pro) lẫn { fullName, phone, address }
    const newAddress = validateAddress(req.body.data ?? req.body);

    const user = await userModel
      .findOneAndUpdate(
        {
          _id: req.user,
          // chỉ push khi chưa đủ MAX_ADDRESSES phần tử
          [`addressDefault.${MAX_ADDRESSES - 1}`]: { $exists: false },
        },
        { $push: { addressDefault: newAddress } },
        { returnDocument: "after" },
      )
      .select("addressDefault");

    if (!user) {
      const exists = await userModel.exists({ _id: req.user });
      if (!exists) throw new NotFoundError("Không tìm thấy người dùng");
      throw new BadRequestError(`Chỉ được lưu tối đa ${MAX_ADDRESSES} địa chỉ`);
    }

    return new Created({
      message: "Thêm điểm giao hàng thành công",
      metadata: user.addressDefault,
    }).send(res);
  }

  async updateAddress(req, res) {
    const { idAddress } = req.params;
    assertObjectId(idAddress, "ID địa chỉ");
    const { fullName, phone, address } = validateAddress(req.body.data ?? req.body);

    const user = await userModel
      .findOneAndUpdate(
        { _id: req.user, "addressDefault._id": idAddress },
        {
          $set: {
            "addressDefault.$.fullName": fullName,
            "addressDefault.$.phone": phone,
            "addressDefault.$.address": address,
          },
        },
        { returnDocument: "after" },
      )
      .select("addressDefault");
    if (!user) throw new NotFoundError("Không tìm thấy địa chỉ");

    return new OK({
      message: "Cập nhật điểm giao hàng thành công",
      metadata: user.addressDefault,
    }).send(res);
  }

  async deleteAddress(req, res) {
    const idAddress = req.params.idAddress ?? req.query.idAddress; // hỗ trợ cả kiểu query của book-pro
    assertObjectId(idAddress, "ID địa chỉ");

    const result = await userModel.updateOne(
      { _id: req.user },
      { $pull: { addressDefault: { _id: idAddress } } },
    );
    if (result.matchedCount === 0) throw new NotFoundError("Không tìm thấy người dùng");
    if (result.modifiedCount === 0) throw new NotFoundError("Không tìm thấy địa chỉ");

    return new OK({ message: "Xóa điểm giao hàng thành công", metadata: true }).send(res);
  }

  /* ------------------------------ SẢN PHẨM YÊU THÍCH ------------------------------ */
  // Bấm lần 1: thích, bấm lần 2: bỏ thích
  async heartProduct(req, res) {
    const { productId } = req.body;
    assertObjectId(productId, "ID sản phẩm");

    const productExists = await productModel.exists({ _id: productId });
    if (!productExists) throw new NotFoundError("Không tìm thấy sản phẩm");

    const hearted = await userModel.exists({ _id: req.user, heartProduct: productId });

    // $pull / $addToSet là thao tác nguyên tử, không bị ghi đè khi bấm nhanh nhiều lần
    const result = await userModel.updateOne(
      { _id: req.user },
      hearted
        ? { $pull: { heartProduct: productId } }
        : { $addToSet: { heartProduct: productId } },
    );
    if (result.matchedCount === 0) throw new NotFoundError("Không tìm thấy người dùng");

    return new OK({
      message: hearted ? "Bỏ yêu thích thành công" : "Thêm yêu thích thành công",
      metadata: { isHearted: !hearted },
    }).send(res);
  }

  // Chỉ trả về mảng id sản phẩm yêu thích
  async getHeartProduct(req, res) {
    const user = await userModel.findById(req.user).select("heartProduct");
    if (!user) throw new NotFoundError("Không tìm thấy người dùng");

    return new OK({
      message: "Lấy danh sách yêu thích thành công",
      metadata: user.heartProduct,
    }).send(res);
  }

  // Trả về thông tin chi tiết từng sản phẩm yêu thích
  async getHeartProductUser(req, res) {
    const user = await userModel.findById(req.user).select("heartProduct");
    if (!user) throw new NotFoundError("Không tìm thấy người dùng");

    const ids = user.heartProduct.filter((id) => mongoose.isValidObjectId(id));
    const products = await productModel
      .find({ _id: { $in: ids } })
      .populate("categoryProduct", "nameCategory")
      .lean();

    const data = products.map((p) => ({
      _id: p._id,
      nameProduct: p.nameProduct,
      priceProduct: p.priceProduct,
      discountProduct: p.discountProduct,
      image: p.imagesProduct?.[0] ?? null,
      // bản cũ sẽ crash nếu danh mục đã bị xóa; ở đây trả null
      category: p.categoryProduct?.nameCategory ?? null,
    }));

    return new OK({
      message: "Lấy danh sách yêu thích thành công",
      metadata: data,
    }).send(res);
  }

  /* ------------------------------ QUẢN TRỊ (ADMIN) ------------------------------ */
  // GET /list?page=1&limit=20&search=abc&isBlocked=true
  async getAllUser(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    const filter = {};
    if (isNonEmptyString(req.query.search)) {
      const regex = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ fullName: regex }, { email: regex }];
    }
    if (req.query.isBlocked === "true") filter.isBlocked = true;
    if (req.query.isBlocked === "false") filter.isBlocked = { $ne: true };

    const [users, total] = await Promise.all([
      userModel
        .find(filter)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      userModel.countDocuments(filter),
    ]);

    return new OK({
      message: "Lấy danh sách người dùng thành công",
      metadata: {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    }).send(res);
  }

  // PATCH /lock/:id  body: { isBlocked: true | false }  (mặc định true = khóa)
  async lockUser(req, res) {
    const { id } = req.params;
    assertObjectId(id, "ID người dùng");
    const isBlocked = typeof req.body?.isBlocked === "boolean" ? req.body.isBlocked : true;

    const target = await userModel.findById(id).select("isAdmin");
    if (!target) throw new NotFoundError("Không tìm thấy người dùng");
    if (target.isAdmin) {
      throw new ForbiddenError("Không thể khóa tài khoản quản trị viên");
    }

    // Dùng isBlocked riêng. Bản cũ lạm dụng isActive (vừa là "đã xác thực email"
    // vừa là "khóa") và còn set nhầm isActive: true khi khóa.
    const update = { isBlocked };
    if (isBlocked) update.refreshToken = []; // đá user ra khỏi mọi thiết bị

    await userModel.updateOne({ _id: id }, { $set: update });

    return new OK({
      message: isBlocked ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công",
      metadata: { id, isBlocked },
    }).send(res);
  }
}

module.exports = new UserController();