import { useEffect, useState } from "react";
import {
  ChevronRight,
  Gift,
 Truck,
  ShieldCheck,
  RefreshCcw,
  Headset,
} from "lucide-react";

import { listCategory } from "../config/categoryRequest";
import { listProducts } from "../config/productRequest";
import ProductCard from "./ProductCard";
import WeeklyBestSeller from "./WeeklyBestSeller";
import FlashSale from "./FlashSale";
import LatestBlogs from "./LatestBlogs";
import CustomerFeedback from "./CustomerFeedback";

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
  const benefitItems = [
    {
        icon: Truck,
        title: "Giao Hàng Siêu Tốc",
        description: "Nội thành 24h, freeship từ 250k",
      },
      {
        icon: ShieldCheck,
        title: "100% Sách Thật",
        description: "Cam kết chính hãng từ NXB",
      },
      {
        icon: RefreshCcw,
        title: "Đổi Trả Dễ Dàng",
        description: "30 ngày miễn phí thu hồi",
      },
      {
        icon: Gift,
        title: "Tích Lũy F-Point",
        description: "Tích lũy 5% mỗi đơn mua",
      },
      {
        icon: Headset,
        title: "Hỗ Trợ Tận Tâm 24/7",
        description: "Hotline 1900 636467 tư vấn",
      },
  ];

  return (
    <div className="w-full bg-[#F2F4F5] text-[#191c1d]">
      <main className="mx-auto flex w-full max-w-[1230px] flex-col gap-6 px-3 py-6 md:px-6">
        {/* =====================================================
            CATEGORY SHORTCUTS
        ====================================================== */}
        <section className="rounded-lg bg-white p-4 shadow-sm md:p-6">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5 md:gap-2">
        {benefitItems.map((item) => {
            const Icon = item.icon;

            return (
                <div
                    key={item.title}
                    className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        p-2.5
                        transition-colors
                        hover:bg-gray-50
                    "
                >
                    {/* Icon */}
                    <div
                        className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#FFD6D6]/40
                            text-[#c92127]
                            transition
                            group-hover:bg-[#FFD6D6]
                        "
                    >
                        <Icon size={26} strokeWidth={1.8} />
                    </div>

                    {/* Nội dung */}
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-bold text-[#191c1d]">
                            {item.title}
                        </span>

                        <span className="text-[11px] leading-tight text-gray-500">
                            {item.description}
                        </span>
                    </div>
                </div>
            );
        })}
    </div>
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
    FLASH SALE
====================================================== */}
<FlashSale />

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
              Sản phẩm nổi bật
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
            WEEKLY BEST SELLER
        ====================================================== */}
        <WeeklyBestSeller/>
         {/* =====================================================
            FEEDBACK KHÁCH HÀNG
        ====================================================== */}
        <CustomerFeedback />
        {/* =====================================================
            BÀI VIẾT MỚI
        ====================================================== */}
        <LatestBlogs />

       

        {/* =====================================================
            PARTNERSHIP BANNER
        ====================================================== */}
      </main>
    </div>
  );
}

export default HomePage;
