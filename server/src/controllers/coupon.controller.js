const { Created, OK } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
//import model
const couponModel = require("../models/coupon.model");
class CouponController {
  //CHỨC NĂNG TẠO MÃ GIẢM GIÁ
  async createCoupon(req, res) {
    // Lấy thông tin từ request body
    const { nameCoupon, discount, quantity, startDate, endDate, minPrice } =
      req.body;
    // trong trường hợp thiếu thông tin thì throw ra lỗi
    if (
      !nameCoupon ||
      !discount ||
      !quantity ||
      !startDate ||
      !endDate ||
      !minPrice
    ) {
      throw new BadRequestError("Thiếu thông tin mã giảm giá");
    }
    //nếu thông tin đầy đủ thì tạo mã giảm giá mới
    const newCoupon = await couponModel.create({
      nameCoupon,
      discount,
      quantity,
      startDate,
      endDate,
      minPrice,
    });
    //trả về thông tin mã giảm giá mới tạo
    return new Created({
      message: "Tạo mã giảm giá thành công",
      metadata: newCoupon,
    }).send(res);
  }
  //CHỨC NĂNG LẤY DANH SÁCH MÃ GIẢM GIÁ
  async getAllCoupon(req, res) {
    const coupons = await couponModel.find();
    return new OK({
      message: "Lấy danh sách mã giảm giá thành công",
      metadata: coupons,
    }).send(res);
  }
  //CHỨC NĂNG CẬP NHẬT MÃ GIẢM GIÁ
  async updateCoupon(req, res) {
    const { id } = req.params;
    const { nameCoupon, discount, quantity, startDate, endDate, minPrice } =
      req.body;
    if (
      !id ||
      !nameCoupon ||
      !discount ||
      !quantity ||
      !startDate ||
      !endDate ||
      !minPrice
    ) {
      throw new BadRequestError("Thiếu thông tin mã giảm giá ");
    }

    const findCoupon = await couponModel.findById(id);
    if (!findCoupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại");
    }

    findCoupon.nameCoupon = nameCoupon;
    findCoupon.discount = discount;
    findCoupon.quantity = quantity;
    findCoupon.startDate = startDate;
    findCoupon.endDate = endDate;
    findCoupon.minPrice = minPrice;
    await findCoupon.save();

    return new OK({
      message: "Cập nhật mã giảm giá thành công",
      metadata: findCoupon,
    }).send(res);
  }
  //CHỨC NĂNG XÓA MÃ GIẢM GIÁ
  async deleteCoupon(req, res) {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Thiếu thông tin mã giảm giá");
    }
    const findCoupon = await couponModel.findById(id);
    if (!findCoupon) {
      throw new NotFoundError("Mã giảm giá không tồn tại");
    }
    await findCoupon.deleteOne();
    return new OK({
      message: "Xóa mã giảm giá thành công",
      metadata: findCoupon,
    }).send(res);
  }
}
module.exports = new CouponController();
