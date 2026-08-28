import { useEffect, useState } from "react";
import {
  ChevronRight,
  Gift,
  GraduationCap,
  Ticket,
  CreditCard,
  Sparkles,
  Gamepad2,
  Languages,
  BookOpen,
  TrendingUp,
  Zap,
} from "lucide-react";

import { listCategory } from "../config/categoryRequest";
import { listProducts } from "../config/productRequest";
import ProductCard from "./ProductCard";

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await listCategory();
        setCategories(res.metadata || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await listProducts();
        setProducts(res.metadata || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCategory();
    fetchProducts();
  }, []);

  // 8 danh mục hiển thị ở khu vực shortcut
  const categoryShortcuts = [
    {
      name: "Sale Sinh Nhật",
      icon: Gift,
    },
    {
      name: "Back To School",
      icon: GraduationCap,
    },
    {
      name: "Mã Giảm Giá",
      icon: Ticket,
    },
    {
      name: "Gift Cards",
      icon: CreditCard,
    },
    {
      name: "Sản Phẩm Mới",
      icon: Sparkles,
    },
    {
      name: "Đồ Chơi",
      icon: Gamepad2,
    },
    {
      name: "Foreign Books",
      icon: Languages,
    },
    {
      name: "Manga",
      icon: BookOpen,
    },
  ];

  return (
    <div className="w-full bg-[#F2F4F5] text-[#191c1d]">
      <main className="mx-auto flex w-full max-w-[1230px] flex-col gap-6 px-3 py-6 md:px-6">
        {/* =====================================================
            CATEGORY SHORTCUTS
        ====================================================== */}
        <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          <div className="grid grid-cols-4 gap-y-6 md:grid-cols-8">
            {categoryShortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  className="
                    group
                    flex
                    flex-col
                    items-center
                    gap-3
                    transition
                    hover:text-[#a30014]
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f2f4f5]
                      transition
                      group-hover:shadow-md
                      md:h-16
                      md:w-16
                    "
                  >
                    <Icon size={28} className="text-[#a30014] md:h-8 md:w-8" />
                  </div>

                  <span
                    className="
                      text-center
                      text-xs
                      font-semibold
                      text-[#191c1d]
                      md:text-sm
                    "
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            FLASH SALE
        ====================================================== */}
        <section className="overflow-hidden rounded-lg bg-[#FCDCDC] shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e4bdba] p-4 md:p-5">
            <div className="flex items-center gap-3">
              <h2
                className="
                  flex
                  items-center
                  gap-2
                  text-2xl
                  font-black
                  italic
                  text-[#a30014]
                  md:text-3xl
                "
              >
                <Zap size={30} fill="currentColor" />
                FLASH SALE
              </h2>

              <div className="hidden items-center gap-1 md:flex">
                <span className="mr-2 text-sm font-semibold">
                  Kết thúc trong
                </span>

                <span className="rounded bg-[#2e3132] px-2 py-1 text-sm font-bold text-white">
                  10
                </span>

                <span className="font-bold">:</span>

                <span className="rounded bg-[#2e3132] px-2 py-1 text-sm font-bold text-white">
                  45
                </span>

                <span className="font-bold">:</span>

                <span className="rounded bg-[#2e3132] px-2 py-1 text-sm font-bold text-white">
                  30
                </span>
              </div>
            </div>

            <button className="flex items-center gap-1 text-sm font-semibold text-[#a30014] hover:underline">
              Xem tất cả
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div
              className="
                grid
                grid-cols-2
                gap-4
                p-4
                md:grid-cols-5
              "
            >
              {products.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="
                    relative
                    rounded-lg
                    bg-white
                    p-3
                    shadow-sm
                    transition
                    hover:-translate-y-1
                    hover:shadow-md
                  "
                >
                  {/* Discount */}
                  {item.discount > 0 && (
                    <span
                      className="
                        absolute
                        right-0
                        top-0
                        z-10
                        rounded-bl-lg
                        rounded-tr-lg
                        bg-[#a30014]
                        px-2
                        py-1
                        text-xs
                        font-bold
                        text-white
                      "
                    >
                      -{item.discount}%
                    </span>
                  )}

                  <ProductCard dataItem={item} />
                </div>
              ))}
            </div>
          ) : (
            <p className="p-5 text-gray-500">No products found.</p>
          )}
        </section>

        {/* =====================================================
            NEW ARRIVALS
        ====================================================== */}
        <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
            <h2
              className="
                text-2xl
                font-bold
                uppercase
                text-[#191c1d]
                md:text-3xl
              "
            >
              New Arrivals
            </h2>

            <button
              className="
                flex
                items-center
                gap-1
                text-sm
                font-semibold
                text-[#a30014]
                hover:underline
              "
            >
              Xem thêm
              <ChevronRight size={18} />
            </button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {products.slice(0, 10).map((item) => (
                <div
                  key={item._id}
                  className="
                    rounded-lg
                    p-2
                    transition
                    hover:shadow-md
                  "
                >
                  <ProductCard dataItem={item} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </section>

        {/* =====================================================
            XU HƯỚNG MUA SẮM
        ====================================================== */}
        <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
            <h2
              className="
                flex
                items-center
                gap-2
                text-lg
                font-bold
                uppercase
                text-[#191c1d]
                md:text-xl
              "
            >
              <TrendingUp size={24} className="text-[#a30014]" />
              Xu Hướng Mua Sắm
            </h2>

            <button className="text-sm font-semibold text-[#a30014] hover:underline">
              Xem thêm
            </button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {products.slice(5, 10).map((item) => (
                <div
                  key={item._id}
                  className="
                    rounded-lg
                    p-2
                    transition
                    hover:shadow-md
                  "
                >
                  <ProductCard dataItem={item} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </section>

        {/* =====================================================
            CATEGORIES FROM API
        ====================================================== */}
        {categories.length > 0 && (
          <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-xl font-bold uppercase text-[#191c1d]">
                Danh Mục Sản Phẩm
              </h2>

              <button className="text-sm font-semibold text-[#a30014] hover:underline">
                Xem tất cả
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((category) => (
                <button
                  key={category._id}
                  className="
                    group
                    flex
                    flex-col
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-gray-200
                    p-4
                    transition
                    hover:border-[#a30014]
                    hover:shadow-md
                  "
                >
                  <div className="h-20 w-20 overflow-hidden rounded-full bg-[#f2f4f5]">
                    <img
                      src={category.imageCategory}
                      alt={category.nameCategory}
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-110
                      "
                    />
                  </div>

                  <span className="text-center text-sm font-semibold text-[#191c1d] group-hover:text-[#a30014]">
                    {category.nameCategory}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            PARTNERSHIP BANNER
        ====================================================== */}
      </main>
    </div>
  );
}

export default HomePage;
