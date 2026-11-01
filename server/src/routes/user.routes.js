const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const usersController = require("../controllers/user.controller");
const { authUser, authAdmin } = require("../middleware/authUser");
const { BadRequestError } = require("../core/error.response");

/* ---------- Upload avatar ---------- */
const AVATAR_DIR = "src/uploads/avatars";
fs.mkdirSync(AVATAR_DIR, { recursive: true }); // multer không tự tạo thư mục

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp|gif)$/.test(file.mimetype)) return cb(null, true);
    cb(new BadRequestError("Chỉ chấp nhận file ảnh (jpg, png, webp, gif)"));
  },
});

// Đổi lỗi của multer (MulterError) thành lỗi 400 thay vì 500
const uploadAvatar = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(
        new BadRequestError(
          err.code === "LIMIT_FILE_SIZE" ? "Ảnh tối đa 2MB" : "Upload ảnh thất bại",
        ),
      );
    }
    next(err);
  });
};

/* ---------- Công khai ---------- */
router.post("/register", AsyncHandler(usersController.register));
router.post("/verify-account", AsyncHandler(usersController.verifyAccount));
router.post("/resend-verify-otp", AsyncHandler(usersController.resendVerifyOtp));
router.post("/login", AsyncHandler(usersController.login));
router.post("/login-google", AsyncHandler(usersController.loginGoogle));
router.post("/forgot-password", AsyncHandler(usersController.forgotPassword));
router.post("/verify-forgot-password", AsyncHandler(usersController.verifyForgotPassword));
router.get("/refresh-token", AsyncHandler(usersController.refreshToken));
// logout KHÔNG cần authUser: access token hết hạn vẫn phải đăng xuất được
router.get("/logout", AsyncHandler(usersController.logout));

/* ---------- Cần đăng nhập ---------- */
router.get("/auth", authUser, AsyncHandler(usersController.authUser));
router.post("/change-password", authUser, AsyncHandler(usersController.changePassword));
router.put("/edit", authUser, uploadAvatar, AsyncHandler(usersController.editUser));
router.get("/search-address", authUser, AsyncHandler(usersController.searchAddress));

router.post("/address", authUser, AsyncHandler(usersController.createAddress));
router.put("/address/:idAddress", authUser, AsyncHandler(usersController.updateAddress));
router.delete("/address/:idAddress", authUser, AsyncHandler(usersController.deleteAddress));

router.post("/heart", authUser, AsyncHandler(usersController.heartProduct));
router.get("/heart", authUser, AsyncHandler(usersController.getHeartProduct));
router.get("/heart/detail", authUser, AsyncHandler(usersController.getHeartProductUser));

/* ---------- Admin ---------- */
router.get("/list", authAdmin, AsyncHandler(usersController.getAllUser));
router.patch("/lock/:id", authAdmin, AsyncHandler(usersController.lockUser));

module.exports = router;