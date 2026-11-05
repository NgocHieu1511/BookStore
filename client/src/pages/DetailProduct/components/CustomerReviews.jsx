
import { useState } from "react";
import { Star } from "lucide-react";

function CustomerReviews({ reviews = [] }) {
  const [filter, setFilter] = useState("all");

  // Chuyển dữ liệu về mảng để tránh lỗi khi API trả về null
  const reviewList = Array.isArray(reviews) ? reviews : [];

  // Tính điểm đánh giá trung bình
  const averageRating =
    reviewList.length > 0
      ? (
          reviewList.reduce(
            (total, review) => total + Number(review.rating || 0),
            0
          ) / reviewList.length
        ).toFixed(1)
      : "0.0";

  // Lọc đánh giá theo số sao
  const filteredReviews =
    filter === "all"
      ? reviewList
      : reviewList.filter(
          (review) => Number(review.rating) === Number(filter)
        );

  // Tính số lượng đánh giá theo sao
  const countRating = (star) =>
    reviewList.filter(
      (review) => Number(review.rating) === star
    ).length;

  // Hiển thị sao
  const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5 text-yellow-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= Number(rating) ? "★" : "☆"}
        </span>
      ))}
    </div>
  );

  return (
    <section className="mb-6 rounded-lg bg-white p-6 shadow-sm">

      {/* Tiêu đề */}
      <h2 className="mb-5 border-b border-gray-100 pb-3
        text-xl font-bold text-gray-900">
        Khách hàng đánh giá
      </h2>

      {/* Tổng quan đánh giá */}
      <div className="mb-6 flex flex-col gap-6
        rounded-lg border border-red-100
        bg-red-50 p-5 md:flex-row md:items-center">

        {/* Điểm trung bình */}
        <div className="flex flex-col items-center
          justify-center md:w-1/4">

          <span className="text-5xl font-bold text-[#c92127]">
            {averageRating}
          </span>

          <Star rating={Math.round(Number(averageRating))} />

          <span className="mt-2 text-sm text-gray-500">
            {reviewList.length} đánh giá
          </span>
        </div>

        {/* Tỷ lệ đánh giá */}
        <div className="flex-1 space-y-2">

          {[5, 4, 3, 2, 1].map((star) => {
            const count = countRating(star);

            const percent =
              reviewList.length > 0
                ? (count / reviewList.length) * 100
                : 0;

            return (
              <div
                key={star}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-10 text-gray-600">
                  {star} sao
                </span>

                <div className="h-2 flex-1 overflow-hidden
                  rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <span className="w-8 text-right text-gray-500">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="mb-5 flex flex-wrap gap-2">

        <button
          onClick={() => setFilter("all")}
          className={`rounded border px-4 py-2 text-sm
            ${
              filter === "all"
                ? "border-[#c92127] bg-red-50 text-[#c92127]"
                : "border-gray-200 text-gray-600"
            }`}
        >
          Tất cả ({reviewList.length})
        </button>

        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => setFilter(String(star))}
            className={`rounded border px-4 py-2 text-sm
              ${
                filter === String(star)
                  ? "border-[#c92127] bg-red-50 text-[#c92127]"
                  : "border-gray-200 text-gray-600"
              }`}
          >
            {star} sao ({countRating(star)})
          </button>
        ))}
      </div>

      {/* Danh sách bình luận */}
      <div className="divide-y divide-gray-100">

        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review._id} className="py-5">

              <div className="flex items-start gap-3">

                {/* Avatar */}
                {review.avatar ? (
                  <img
                    src={
                      
                      review.avatar
                    }
                    alt={review.name}
                    className="h-11 w-11 rounded-full
                      border object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11
                    items-center justify-center rounded-full
                    bg-red-100 font-bold text-[#c92127]">
                    {review.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                <div className="min-w-0 flex-1">

                  {/* Tên khách hàng */}
                  <h3 className="text-sm font-bold text-gray-800">
                    {review.name || "Khách hàng"}
                  </h3>

                  {/* Sao */}
                  <div className="mt-1 flex flex-wrap
                    items-center gap-3">
                    <Stars rating={review.rating} />

                    <span className="text-xs text-gray-400">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("vi-VN")
                        : ""}
                    </span>
                  </div>

                  {/* Nội dung đánh giá */}
                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {review.content || "Không có nội dung đánh giá"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-sm text-gray-500">
            Chưa có đánh giá nào cho sản phẩm này.
          </div>
        )}
      </div>
    </section>
  );
}

export default CustomerReviews;
