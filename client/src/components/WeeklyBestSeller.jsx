import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trophy } from "lucide-react";
import { message } from "antd";
import { getBestSeller } from "../config/productRequest";
import { listCategory } from "../config/categoryRequest";
import { requestAddToCart } from "../config/cartRequest";
import { useStore } from "../hooks/useStore";

const rankColors = [
  "bg-[#f59e0b] text-white",
  "bg-[#94a3b8] text-white",
  "bg-[#d97706] text-white",
  "bg-gray-200 text-gray-700",
  "bg-gray-200 text-gray-700",
];

const formatPrice = (price) => new Intl.NumberFormat("vi-VN").format(price) + " đ";

function WeeklyBestSeller() {
  const navigate = useNavigate();
  const { dataUser, getCart } = useStore();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");   // "" = Tất cả
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Danh mục cho bộ lọc
  useEffect(() => {
    (async () => {
      try {
        const res = await listCategory();
        setCategories(res.metadata || []);
      } catch (e) {
        console.error("Lỗi lấy danh mục:", e);
      }
    })();
  }, []);

  // Sách bán chạy, tải lại mỗi khi đổi danh mục
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await getBestSeller(selectedCategory);
        if (!ignore) setProducts(res.metadata || []);
      } catch (e) {
        console.error("Lỗi lấy sách bán chạy:", e);
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [selectedCategory]);

  const handleAddToCart = async (product) => {
    if (!dataUser?._id) {
      navigate("/login");
      return;
    }
    try {
      const res = await requestAddToCart({ productId: product._id, quantity: 1 });
      await getCart();
      message.success(res.message);
    } catch (e) {
      message.error(e?.response?.data?.message || "Thêm thất bại");
    }
  };

  // Thanh "đã bán" tính theo sách bán nhiều nhất (đứng đầu bảng)
  const maxSold = Math.max(...products.map((p) => p.sold || 0), 1);

  return (
    <section className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-gray-200 pb-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Trophy className="text-[#c92127]" size={28} />
          <h2 className="text-lg font-bold uppercase text-gray-900">
            Bảng xếp hạng bán chạy nhất tuần
          </h2>
        </div>

        {/* Bộ lọc danh mục */}
        <div className="flex flex-wrap gap-2">
          {[{ _id: "", nameCategory: "Tất cả" }, ...categories].map((c) => (
            <button
              key={c._id || "all"}
              onClick={() => setSelectedCategory(c._id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                selectedCategory === c._id
                  ? "bg-[#c92127] text-white"
                  : "bg-gray-100 text-gray-700 hover:text-[#c92127]"
              }`}
            >
              {c.nameCategory}
            </button>
          ))}
        </div>
      </div>

      {/* Xếp hạng */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {products.map((product, index) => {
          const discount = product.discountProduct || 0;
          const original = Number(product.priceProduct || 0);
          const price = discount > 0 ? Math.round(original * (1 - discount / 100)) : original;
          const sold = product.sold || 0;

          return (
            <div
              key={product._id}
              className="group relative flex flex-col gap-2 rounded-lg border border-transparent bg-gray-50 p-3 transition-all hover:border-red-200 hover:bg-white hover:shadow-md"
            >
              <div
                className={`absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-black shadow-md ${
                  rankColors[index] || rankColors[4]
                }`}
              >
                {index + 1}
              </div>

              {discount > 0 && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-[#c92127] px-2 py-0.5 text-xs font-bold text-white">
                  -{discount}%
                </span>
              )}

              <Link to={`/product/${product._id}`} className="flex flex-col gap-2">
                <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded bg-gray-100">
                  {product.imagesProduct?.[1] || product.imagesProduct?.[0] ? (
                    <img
                      src={product.imagesProduct[1] || product.imagesProduct[0]}
                      alt={product.nameProduct}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-5xl text-gray-300">📚</span>
                  )}
                </div>

                <h3 className="mt-1 line-clamp-2 h-10 text-sm font-semibold text-gray-800">
                  {product.nameProduct}
                </h3>
              </Link>

              <div className="flex flex-col">
                <span className="text-base font-bold text-[#c92127]">{formatPrice(price)}</span>
                {discount > 0 && (
                  <span className="text-xs text-gray-500 line-through">{formatPrice(original)}</span>
                )}
              </div>

              <div className="relative mt-1 flex h-3.5 w-full items-center overflow-hidden rounded-full bg-[#FFD6D6]">
                <div
                  className="h-full rounded-full bg-[#c92127]"
                  style={{ width: `${Math.min((sold / maxSold) * 100, 100)}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                  Đã bán {sold.toLocaleString("vi-VN")}
                </span>
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stockProduct <= 0}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-[#c92127] py-1.5 text-xs font-bold text-[#c92127] transition-colors hover:bg-[#c92127] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={14} />
                {product.stockProduct <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
              </button>
            </div>
          );
        })}

        {!loading && products.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            Chưa có sản phẩm trong danh mục này.
          </div>
        )}
      </div>
    </section>
  );
}

export default WeeklyBestSeller;