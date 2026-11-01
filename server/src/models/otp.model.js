const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpModel = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email không được để trống"],
      index: true,
    },
    // Lưu bản HASH (bcrypt) của OTP, không lưu OTP gốc
    otp: {
      type: String,
      required: [true, "OTP không được để trống"],
    },
    type: {
      type: String,
      enum: ["verifyAccount", "forgotPassword"],
      required: [true, "Loại OTP không được để trống"],
    },
    // Số lần đã nhập thử, quá giới hạn (xem controller) thì OTP bị vô hiệu
    attempts: { type: Number, default: 0 },

    // TTL index: MongoDB tự xóa document khi tới expiresAt (OTP sống 5 phút)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("OTP", otpModel);