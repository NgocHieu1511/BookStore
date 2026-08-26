const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpModel = new Schema(
  {
    otp: {
      type: String,
      required: [true, "OTP không được để trống"],
    },
    email: {
      type: String,
      required: [true, "Email không được để trống"],
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // OTP sẽ hết hạn sau 5 phút
    },
  },
  {
    timestamps: true,
    //tạo ra createdAt, updateAt
  },
);

module.exports = mongoose.model("OTP", otpModel);
