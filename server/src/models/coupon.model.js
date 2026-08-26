const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const couponModel = new Schema(
  {
    //tên mã giảm giá
    nameCoupon: { type: String, require: true },
    //phần trăm giảm giá
    discount: { type: Number, require: true },
    //số lượng mã giảm giá
    quantity: { type: Number, require: true },
    //ngày bắt đầu của mã giảm giá
    startDate: { type: Date, require: true },
    //ngày kết thúc của mã giảm giá
    endDate: { type: Date, require: true },
    //số tiền tối thiểu để áp dụng mã giảm giá (giá trị của đơn hàng)
    minPrice: { type: Number, require: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("coupon", couponModel);
