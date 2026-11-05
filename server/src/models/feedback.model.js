const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedbackModel = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "products", required: true },
    // Đơn hàng mà người dùng đã mua sản phẩm này
    paymentId: { type: Schema.Types.ObjectId, ref: "payment", required: true },
    imagesFeedback: { type: [String], default: [] },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  },
  {
    timestamps: true,
  },
);

// Mỗi sản phẩm trong một đơn hàng chỉ được đánh giá 1 lần.
// partialFilterExpression: bỏ qua các feedback cũ chưa có paymentId để index không bị lỗi.
feedbackModel.index(
  { paymentId: 1, productId: 1 },
  { unique: true, partialFilterExpression: { paymentId: { $type: "objectId" } } },
);

// Phục vụ lấy danh sách đánh giá / tính điểm trung bình theo sản phẩm
feedbackModel.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model("feedback", feedbackModel);
