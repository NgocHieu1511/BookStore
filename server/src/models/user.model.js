const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Tên không được để trống"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email không được để trống"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Mật khẩu không được để trống"],
      minlength: 6,
    },

    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    //tạo ra createdAt, updateAt
  },
);

module.exports = mongoose.model("User", userSchema);
