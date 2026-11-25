import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quote } from "lucide-react";
import { listLatestFeedback } from "../config/feedbackRequest";

function Stars({ value = 0 }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= value ? "text-yellow-400" : "text-gray-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CustomerFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await listLatestFeedback();
        const list = res?.metadata || res?.data || [];
        setFeedbacks(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  if (feedbacks.length === 0) return null;

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold uppercase text-[#191c1d] md:text-2xl">
          Khách hàng nói gì về chúng tôi
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {feedbacks.map((item) => {
          const user = item.userId || {};
          const product = item.productId || {};

          return (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-[#c92127] hover:shadow-md"
            >
              {/* User */}
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD6D6] font-bold text-[#c92127]">
                    {(user.fullName || "K").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {user.fullName || "Khách hàng"}
                  </p>
                  <Stars value={item.rating} />
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1">
                <Quote
                  size={16}
                  className="absolute -left-1 -top-1 text-gray-200"
                />
                <p className="line-clamp-4 pl-4 text-sm leading-relaxed text-gray-700">
                  {item.content}
                </p>
              </div>

              {/* Images */}
              {item.imagesFeedback?.length > 0 && (
                <div className="flex gap-2">
                  {item.imagesFeedback.slice(0, 3).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Feedback ${index + 1}`}
                      className="h-14 w-14 rounded object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Product */}
              {product._id && (
                <button
                  type="button"
                  onClick={() => navigate(`/product/${product._id}`)} // đổi theo route chi tiết sản phẩm của bạn
                  className="flex items-center gap-2 rounded bg-gray-50 p-2 text-left hover:bg-gray-100"
                >
                  {product.imagesProduct?.[0] && (
                    <img
                      src={product.imagesProduct[0]}
                      alt={product.nameProduct}
                      className="h-10 w-8 object-contain"
                    />
                  )}
                  <span className="line-clamp-2 text-xs text-gray-600">
                    {product.nameProduct}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CustomerFeedback;