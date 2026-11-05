
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

function RelatedProducts({ products = [] }) {
  const navigate = useNavigate();

  const productList = Array.isArray(products) ? products : [];

  if (productList.length === 0) {
    return null;
  }

  return (
    <section className="mb-6 rounded-lg bg-white p-6 shadow-sm">

      {/* Tiêu đề */}
      <div className="mb-5 flex items-center
        justify-between border-b border-gray-100 pb-3">

        <h2 className="text-xl font-bold text-gray-900">
          Sản phẩm liên quan
        </h2>

        <span className="text-sm text-gray-400">
          {productList.length} sản phẩm
        </span>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="grid grid-cols-2 gap-4
        sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

        {productList.slice(0, 5).map((item) => {
          const images = Array.isArray(item.imagesProduct)
            ? item.imagesProduct
            : [];

          const image = images[0];

          const price = Number(item.priceProduct || 0);

          const discount = Number(item.discountProduct || 0);

          const oldPrice =
            discount > 0
              ? Math.round(price / (1 - discount / 100))
              : null;

          return (
            <div
              key={item._id}
              onClick={() => navigate(`/product/${item._id}`)}
              className="group cursor-pointer overflow-hidden
                rounded-lg border border-gray-100
                transition hover:border-red-200
                hover:shadow-md"
            >

              {/* Ảnh sản phẩm */}
              <div className="relative flex h-44
                items-center justify-center
                overflow-hidden bg-white p-3">

                {image ? (
                  <img
                    src={image}
                    alt={item.nameProduct}
                    className="h-full w-full object-contain
                      transition duration-300
                      group-hover:scale-105"
                  />
                ) : (
                  <div className="text-sm text-gray-400">
                    Không có hình ảnh
                  </div>
                )}

                {/* Nhãn giảm giá */}
                {discount > 0 && (
                  <span className="absolute left-2 top-2
                    rounded bg-[#c92127] px-2 py-1
                    text-xs font-bold text-white">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Thông tin sản phẩm */}
              <div className="p-3">

                <h3 className="mb-2 line-clamp-2
                  min-h-10 text-sm font-medium
                  text-gray-800 group-hover:text-[#c92127]">
                  {item.nameProduct}
                </h3>

                {/* Giá */}
                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-base font-bold
                    text-[#c92127]">
                    {price.toLocaleString("vi-VN")} đ
                  </span>

                  {oldPrice && (
                    <span className="text-xs text-gray-400
                      line-through">
                      {oldPrice.toLocaleString("vi-VN")} đ
                    </span>
                  )}
                </div>

                {/* Đánh giá */}
                <div className="mt-2 flex items-center gap-1">

                  <Star
                    size={14}
                    fill="#facc15"
                    className="text-yellow-400"
                  />

                  <span className="text-xs text-gray-500">
                    {item.rating || 0}
                  </span>

                  <span className="ml-auto text-xs text-gray-400">
                    Đã bán {item.countBuy || 0}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedProducts;
