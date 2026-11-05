const feedbackModel = require("../models/feedback.model");

const roundOneDecimal = (value) => Math.round(Number(value || 0) * 10) / 10;

// Điểm TB + số lượt đánh giá cho NHIỀU sản phẩm bằng 1 query
async function getRatingMap(productIds) {
  const stats = await feedbackModel.aggregate([
    { $match: { productId: { $in: productIds } } },
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
    .find({ productId })
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
  }));
}

module.exports = { getRatingMap, attachRatings, getFeedbackByProduct };