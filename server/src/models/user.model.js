const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userModel = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Tên không được để trống"],
      trim: true,
    },
    avatar: { type: String, default: "" },

    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Tài khoản đăng nhập bằng Google không có mật khẩu -> chỉ bắt buộc khi typeLogin != google
    // select: false -> mặc định KHÔNG bao giờ trả password ra khi query (cần thì .select("+password"))
    password: {
      type: String,
      required: [
        function () {
          return this.typeLogin !== "google";
        },
        "Mật khẩu không được để trống",
      ],
      minlength: 6,
      select: false,
    },

    isAdmin: { type: Boolean, default: false },

    // Đổi Number -> String: Number làm mất số 0 đầu ("0912345678" thành 912345678)
    phone: { type: String, default: "" },

    // isActive: đã xác thực email hay chưa
    isActive: { type: Boolean, default: false },
    // isBlocked: bị admin khóa (tách riêng khỏi isActive)
    isBlocked: { type: Boolean, default: false },

    addressDefault: [
      {
        fullName: String,
        phone: String,
        address: String,
      },
    ],
    heartProduct: [{ type: String, ref: "products" }],

    // Lưu SHA-256 của các refresh token còn hiệu lực (mỗi thiết bị 1 token) để thu hồi được
    refreshToken: { type: [String], default: [], select: false },

    // Bản cũ: default: Date.now() -> chạy 1 lần lúc khởi động server, mọi user cùng một giờ
    lastOnline: { type: Date, default: Date.now },
    typeLogin: { type: String, enum: ["email", "google"], default: "email" },
  },
  {
    timestamps: true,
    toJSON: {
      // Lớp bảo vệ thứ 2: dù lỡ select thừa, JSON trả về vẫn không có các field nhạy cảm
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userModel);