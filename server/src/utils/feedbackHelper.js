const feedbackModel = require("../models/feedback.model");

const roundOneDecimal = (value) => Math.round(Number(value || 0) * 10) / 10;

// Điểm TB + số lượt đánh giá cho NHIỀU sản phẩm bằng 1 query
async function getRatingMap(productIds) {
  const stats = await feedbackModel.aggregate([
   // getRatingMap: thêm isHidden vào $match
{ $match: { productId: { $in: productIds }, isHidden: { $ne: true } } },
    { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  return new Map(
    stats.map((item) => [
      String(item._id),
      { rating: roundOneDecimal(item.avgRating), totalReviews: item.totalReviews },
    ]),
  );
}

// Gắn rating + totalReviews vào danh sách sản phẩm
async function attachRatings(products) {
  const ratingMap = await getRatingMap(products.map((item) => item._id));
  return products.map((item) => {
    const stat = ratingMap.get(String(item._id));
    return { ...item, rating: stat?.rating || 0, totalReviews: stat?.totalReviews || 0 };
  });
}

// Danh sách đánh giá của 1 sản phẩm, kèm tên + avatar người đánh giá
async function getFeedbackByProduct(productId) {
  const feedbacks = await feedbackModel
    // getFeedbackByProduct: thêm isHidden vào find
    .find({ productId, isHidden: { $ne: true } })
    .populate("userId", "fullName avatar")
    .sort({ createdAt: -1 })
    .lean();

  return feedbacks.map((item) => ({
    _id: item._id,
    rating: item.rating,
    content: item.content,
    imagesFeedback: item.imagesFeedback || [],
    createdAt: item.createdAt,
    name: item.userId?.fullName || "Người dùng ẩn danh",
    avatar: item.userId?.avatar || "",
    adminReply: item.adminReply?.content
      ? { content: item.adminReply.content, repliedAt: item.adminReply.repliedAt }
      : null,
  }));
}

module.exports = { getRatingMap, attachRatings, getFeedbackByProduct };