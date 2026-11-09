
import { ShoppingCart, Trophy } from "lucide-react";
import React from "react";

const defaultProducts = [
  {
    id: 1,
    name: "Cái Giá Của Sự Nhỏ Nhen",
    image: "",
    price: 82500,
    originalPrice: 110000,
    discount: 25,
    sold: 1850,
    category: "Văn Học",
  },
  {
    id: 2,
    name: "Lục Vân Tiên (Bản Đẹp Minh Họa)",
    image: "",
    price: 105000,
    originalPrice: 150000,
    discount: 30,
    sold: 1420,
    category: "Văn Học",
  },
  {
    id: 3,
    name: "Đắc Nhân Tâm (Khổ Lớn)",
    image: "",
    price: 68800,
    originalPrice: 86000,
    discount: 20,
    sold: 1150,
    category: "Kinh Tế",
  },
  {
    id: 4,
    name: "Nhà Giả Kim (Paulo Coelho)",
    image: "",
    price: 67150,
    originalPrice: 79000,
    discount: 15,
    sold: 980,
    category: "Văn Học",
  },
  {
    id: 5,
    name: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
    image: "",
    price: 72000,
    originalPrice: 90000,
    discount: 20,
    sold: 860,
    category: "Tâm Lý - Kỹ Năng",
  },
];

const categories = [
  "Tất cả",
  "Văn Học",
  "Kinh Tế",
  "Tâm Lý - Kỹ Năng",
  "Thiếu Nhi",
  "Sách Ngoại Văn",
];

const rankColors = [
  "bg-[#f59e0b] text-white",
  "bg-[#94a3b8] text-white",
  "bg-[#d97706] text-white",
  "bg-gray-200 text-gray-700",
  "bg-gray-200 text-gray-700",
];

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price) + " đ";
}

function WeeklyBestSeller({
  products = defaultProducts,
  onAddToCart,
}) {
  const [selectedCategory, setSelectedCategory] = React.useState("Tất cả");

  const filteredProducts =
    selectedCategory === "Tất cả"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <section className="bg-white rounded-lg shadow-sm p-4 md:p-6 flex flex-col gap-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-3 gap-3">

        <div className="flex items-center gap-2">
          <Trophy className="text-[#c92127]" size={28} />

          <h2 className="text-lg font-bold text-gray-900 uppercase">
            Bảng xếp hạng bán chạy nhất tuần
          </h2>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                selectedCategory === category
                  ? "bg-[#c92127] text-white"
                  : "bg-gray-100 text-gray-700 hover:text-[#c92127]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product ranking */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="flex flex-col gap-2 relative bg-gray-50 hover:bg-white p-3 rounded-lg border border-transparent hover:border-red-200 hover:shadow-md transition-all group"
          >

            {/* Rank */}
            <div
              className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md text-sm z-10 ${
                rankColors[index] || rankColors[4]
              }`}
            >
              {index + 1}
            </div>

            {/* Discount */}
            {product.discount > 0 && (
              <span className="absolute top-2 right-2 bg-[#c92127] text-white text-xs px-2 py-0.5 rounded-full font-bold z-10">
                -{product.discount}%
              </span>
            )}

            {/* Product image */}
            <div className="aspect-[3/4] w-full rounded overflow-hidden bg-gray-100 flex items-center justify-center">

              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <span className="text-gray-300 text-5xl">
                  📚
                </span>
              )}

            </div>

            {/* Product name */}
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 h-10 mt-1">
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex flex-col">
              <span className="text-[#c92127] font-bold text-base">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice > product.price && (
                <span className="text-gray-500 text-xs line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Sold progress */}
            <div className="w-full bg-[#FFD6D6] rounded-full h-3.5 overflow-hidden relative flex items-center mt-1">

              <div
                className="bg-[#c92127] h-full rounded-full"
                style={{
                  width: `${
                    Math.min(
                      (product.sold / 2000) * 100,
                      100
                    )
                  }%`,
                }}
              />

              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">
                Đã bán {product.sold.toLocaleString("vi-VN")}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={() => onAddToCart?.(product)}
              className="mt-2 w-full py-1.5 border border-[#c92127] text-[#c92127] hover:bg-[#c92127] hover:text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1"
            >
              <ShoppingCart size={14} />
              Thêm vào giỏ
            </button>

          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Chưa có sản phẩm trong danh mục này.
          </div>
        )}

      </div>
    </section>
  );
}

export default WeeklyBestSeller;
