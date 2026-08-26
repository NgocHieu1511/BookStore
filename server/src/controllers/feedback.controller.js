const feedbackModel = require("../models/feedback.model");
const paymentModel = require("../models/payment.model");

const { NotFoundError, BadRequestError } = require("../core/error.response");
const { Created, OK } = require("../core/success.response");

const cloudinary = require("../config/Cloudinary");

class FeedbackController {
  async createFeedback(req, res) {
    // lấy ra id của người dùng
    try {
      const id = req.user;
      const { paymentId, content, rating, productId } = req.body;
      const dataImages = req.files;
      const findPayment = await paymentModel.findById(paymentId);

      if (!findPayment) {
        throw new NotFoundError("Đơn hàng không tồn tại");
      }
      // kiểm tra xem đơn hàng đã hoàn thành chưa
      // đơn hàng phải được hoàn thành mới được đánh giá sản phẩm
      if (findPayment.status !== "completed") {
        throw new BadRequestError("Đơn hàng chưa hoàn thành");
      }

      let imagesFeedback = [];
      // upload ảnh lên cloudinary

      for (const image of dataImages) {
        const { path, filename } = image;
        const { url } = await cloudinary.uploader.upload(path, {
          folder: "feedbacks",
          resource_type: "image",
        });
        imagesFeedback.push(url || filename);
      }
      // tạo ra feedback mới
      //người dùng không được phép sửa feedback đã tạo ra

      const newFeedback = await feedbackModel.create({
        userId: id,
        productId,
        content,
        rating: Number(rating),
        imagesFeedback,
      });
      return new Created({
        message: "Đánh giá sản phẩm thành công",
        metadata: newFeedback,
      }).send(res);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new FeedbackController();
