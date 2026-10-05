const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    nameCategory: {
      type: String,
      required: [true, "Tên danh mục không được để trống"],
      trim: true,
    },

    imageCategory: {
      type: String,
      required: [true, "Ảnh danh mục không được để trống"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("category", categorySchema);