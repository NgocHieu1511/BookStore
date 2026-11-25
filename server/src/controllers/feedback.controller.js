const fs = require("fs/promises");
const mongoose = require("mongoose");

const feedbackModel = require("../models/feedback.model");
const paymentModel = require("../models/payment.model");
const { NotFoundError, BadRequestError, ConflictRequestError, BadGatewayError } = require("../core/error.response");
const { Created, OK } = require("../core/success.response");
const cloudinary = require("../config/Cloudinary");
const getPublicId = require("../utils/getPublicId");

const REVIEWABLE_STATUSES = ["delivered", "completed"];
const MAX_CONTENT_LENGTH = 70;

// Xóa file tạm multer lưu trên ổ đĩa
const removeTempFiles = (files) =>
  Promise.all(files.map((file) => fs.unlink(file.path).catch(() => {})));

// Xóa ảnh đã lên Cloudinary khi tạo đánh giá thất bại
const destroyImages = (urls) =>
  Promise.all(
    urls.map(async (url) => {
      try { await cloudinary.uploader.destroy(getPublicId(url)); }
      catch (error) { console.warn("Không thể xóa ảnh feedback:", error.message); }
    }),
  );
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestError("ID đánh giá không hợp lệ");
};

class FeedbackController {
  async createFeedback(req, res) {
    const userId = req.user;            // lấy từ token, KHÔNG lấy từ body
    const files = req.files || [];
    const uploadedImages = [];

    try {
      const { paymentId, productId, content, rating } = req.body;

      // 1. Dữ liệu đầu vào
      if (!paymentId || !productId || !content?.trim() || !rating) {
        throw new BadRequestError("Vui lòng nhập đầy đủ thông tin đánh giá");
      }
      if (!mongoose.Types.ObjectId.isValid(paymentId) || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new BadRequestError("Mã đơn hàng hoặc mã sản phẩm không hợp lệ");
      }
      const ratingNumber = Number(rating);
      if (!Number.isInteger(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
        throw new BadRequestError("Số sao đánh giá phải từ 1 đến 5");
      }
      const contentText = content.trim();
      if (contentText.length > MAX_CONTENT_LENGTH) {
        throw new BadRequestError(`Nội dung đánh giá tối đa ${MAX_CONTENT_LENGTH} ký tự`);
      }

      // 2. Đơn phải là của chính người này
      const findPayment = await paymentModel.findOne({ _id: paymentId, userId });
      if (!findPayment) throw new NotFoundError("Đơn hàng không tồn tại");

      // 3. Đơn phải đã giao
      if (!REVIEWABLE_STATUSES.includes(findPayment.status)) {
        throw new BadRequestError("Chỉ được đánh giá sau khi đơn hàng đã được giao");
      }

      // 4. Sản phẩm phải nằm trong đơn
      const isInOrder = findPayment.products.some((item) => String(item.productId) === String(productId));
      if (!isInOrder) throw new BadRequestError("Sản phẩm không thuộc đơn hàng này");

      // 5. Chưa đánh giá trước đó
      if (await feedbackModel.exists({ paymentId, productId })) {
        throw new ConflictRequestError("Bạn đã đánh giá sản phẩm này rồi");
      }

      // 6. Upload ảnh (song song, giữ thứ tự)
      const settled = await Promise.allSettled(
        files.map((file) => cloudinary.uploader.upload(file.path, { folder: "feedbacks", resource_type: "image" })),
      );
      settled.forEach((item) => {
        if (item.status === "fulfilled") uploadedImages.push(item.value.secure_url);
      });
      if (settled.some((item) => item.status === "rejected")) {
        throw new BadGatewayError("Tải ảnh lên thất bại, vui lòng thử lại");
      }

      // 7. Lưu
      const newFeedback = await feedbackModel.create({
        userId, productId, paymentId,
        content: contentText, rating: ratingNumber, imagesFeedback: uploadedImages,
      });

      return new Created({ message: "Đánh giá sản phẩm thành công", metadata: newFeedback }).send(res);
    } catch (error) {
      await destroyImages(uploadedImages);   // lỗi ở bước nào cũng dọn ảnh đã lên Cloudinary
      if (error?.code === 11000) {           // 2 request gửi cùng lúc, unique index chặn request sau
        throw new ConflictRequestError("Bạn đã đánh giá sản phẩm này rồi");
      }
      throw error;
    } finally {
      await removeTempFiles(files);          // luôn dọn file tạm
    }
  }

  // Danh sách sản phẩm user đã đánh giá, để client ẩn nút "Đánh giá"
  async getMyFeedbacks(req, res) {
    const feedbacks = await feedbackModel.find({ userId: req.user }).select("paymentId productId").lean();
    return new OK({ message: "Lấy danh sách đánh giá của bạn thành công", metadata: feedbacks }).send(res);
  }
    // GET /list?page=&limit=&rating=&isHidden=&replied=&search=
  async getAllFeedback(req, res) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    const filter = {};
    const rating = Number(req.query.rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) filter.rating = rating;

    if (req.query.isHidden === "true") filter.isHidden = true;
    if (req.query.isHidden === "false") filter.isHidden = { $ne: true };

    if (req.query.replied === "true") filter["adminReply.content"] = { $nin: [null, ""] };
    if (req.query.replied === "false") filter["adminReply.content"] = { $in: [null, ""] };

    if (req.query.search?.trim()) {
      filter.content = new RegExp(escapeRegex(req.query.search.trim()), "i");
    }

    const [feedbacks, total] = await Promise.all([
      feedbackModel
        .find(filter)
        .populate("userId", "fullName email avatar")
        .populate("productId", "nameProduct imagesProduct")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      feedbackModel.countDocuments(filter),
    ]);

    return new OK({
      message: "Lấy danh sách đánh giá thành công",
      metadata: {
        feedbacks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    }).send(res);
  }

  // PATCH /hide/:id   body: { isHidden: true | false }
  async toggleHidden(req, res) {
    const { id } = req.params;
    assertId(id);
    const { isHidden } = req.body || {};
    if (typeof isHidden !== "boolean") throw new BadRequestError("isHidden phải là true hoặc false");

    const feedback = await feedbackModel.findByIdAndUpdate(id, { isHidden }, { new: true });
    if (!feedback) throw new NotFoundError("Không tìm thấy đánh giá");

    return new OK({ message: isHidden ? "Đã ẩn đánh giá" : "Đã hiện đánh giá", metadata: feedback }).send(res);
  }

  // POST /reply/:id   body: { content }
  async replyFeedback(req, res) {
    const { id } = req.params;
    assertId(id);
    const content = req.body?.content?.trim();
    if (!content) throw new BadRequestError("Nội dung phản hồi không được để trống");
    if (content.length > 300) throw new BadRequestError("Phản hồi tối đa 300 ký tự");

    const feedback = await feedbackModel.findByIdAndUpdate(
      id,
      { adminReply: { content, repliedAt: new Date() } },
      { new: true },
    );
    if (!feedback) throw new NotFoundError("Không tìm thấy đánh giá");

    return new OK({ message: "Đã gửi phản hồi", metadata: feedback }).send(res);
  }

  // DELETE /delete/:id
  async deleteFeedback(req, res) {
    const { id } = req.params;
    assertId(id);

    const feedback = await feedbackModel.findByIdAndDelete(id);
    if (!feedback) throw new NotFoundError("Không tìm thấy đánh giá");

    await destroyImages(feedback.imagesFeedback || []); // dọn ảnh trên Cloudinary
    return new OK({ message: "Đã xóa đánh giá" }).send(res);
  }
async getLatestFeedback(req, res) {
    try {
      const feedbacks = await feedbackModel
        .find({ rating: { $gte: 4 }, isHidden: { $ne: true } })  
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("userId", "fullName avatar")
        .populate("productId", "nameProduct imagesProduct");

      return res.status(200).json({ message: "Success", metadata: feedbacks });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}
  

module.exports = new FeedbackController();