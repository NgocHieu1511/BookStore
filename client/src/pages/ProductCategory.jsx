import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, PackageOpen } from "lucide-react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import PaginationPage from "../components/Pagination/Pagination";
import { getProductsByCategory } from "../config/productRequest";
import { listCategory } from "../config/categoryRequest";

// Số sản phẩm mỗi trang
const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
];

// Sắp xếp phía client (API hiện chưa hỗ trợ sort)
function sortProducts(list, sort) {
  const arr = [...list];

  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.priceProduct - b.priceProduct);
    case "price-desc":
      return arr.sort((a, b) => b.priceProduct - a.priceProduct);
    case "bestseller":
      return arr.sort((a, b) => (b.countBuy || 0) - (a.countBuy || 0));
    default:
      return arr.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
  }
}

function ProductCategory() {
  const { id } = useParams(); // id danh mục lấy từ URL /category/:id
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page"), 10) || 1;

  // ==============================
  // LẤY DANH SÁCH DANH MỤC (sidebar + tên danh mục)
  // ==============================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await listCategory();
        setCategories(res.metadata || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // ==============================
  // LẤY SẢN PHẨM THEO DANH MỤC (gọi lại khi đổi id)
  // ==============================
  useEffect(() => {
    let ignore = false; // tránh set state khi đã đổi sang danh mục khác

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await getProductsByCategory(id);
        if (!ignore) setProducts(res.metadata || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (!ignore) setProducts([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Cuộn lên đầu khi đổi danh mục hoặc đổi trang
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, page]);

  // ==============================
  // SẮP XẾP + PHÂN TRANG
  // ==============================
  const sortedProducts = useMemo(
    () => sortProducts(products, sort),
    [products, sort],
  );

  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  const pagedProducts = sortedProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const currentCategory = categories.find((c) => c._id === id);

  // Đổi kiểu sắp xếp -> về trang 1 (setSearchParams thay toàn bộ query)
  const handleSort = (value) => {
    setSearchParams({ sort: value });
  };

  return (
    <div className="min-h-screen bg-[#F2F4F5] text-[#191c1d]">
      <Header />

      <main className="mx-auto w-full max-w-[1230px] px-3 py-4 md:px-6">
        {/* ================= BREADCRUMB ================= */}
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link to="/" className="hover:text-[#c92127]">
            Trang chủ
          </Link>
          <ChevronRight size={14} />
          <span className="font-semibold text-[#191c1d]">
            {currentCategory?.nameCategory || "Danh mục"}
          </span>
        </nav>

        {/* ================= DANH MỤC (mobile: chip cuộn ngang) ================= */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category._id}`}
              className={`
                shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors
                ${
                  category._id === id
                    ? "border-[#c92127] bg-[#c92127] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-[#c92127] hover:text-[#c92127]"
                }
              `}
            >
              {category.nameCategory}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-4">
          {/* ================= SIDEBAR (desktop) ================= */}
          <aside className="sticky top-40 hidden w-60 shrink-0 rounded-lg bg-white p-3 shadow-sm lg:block">
            <h2 className="px-3 pb-2 pt-1 text-base font-bold uppercase">
              Danh mục sản phẩm
            </h2>

            <ul className="space-y-1">
              {categories.map((category) => {
                const isActive = category._id === id;

                return (
                  <li key={category._id}>
                    <Link
                      to={`/category/${category._id}`}
                      className={`
                        block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors
                        ${
                          isActive
                            ? "bg-[#f3f4f6] text-[#c92127]"
                            : "text-gray-800 hover:bg-[#f3f4f6]"
                        }
                      `}
                    >
                      {category.nameCategory}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* ================= NỘI DUNG CHÍNH ================= */}
          <section className="min-w-0 flex-1 rounded-lg bg-white p-4 shadow-sm md:p-5">
            {/* Tiêu đề + sắp xếp */}
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-4">
              <div className="flex items-baseline justify-between gap-2">
                <h1 className="text-xl font-bold uppercase md:text-2xl">
                  {currentCategory?.nameCategory || "Sản phẩm"}
                </h1>

                {!loading && (
                  <span className="shrink-0 text-sm text-gray-500">
                    {sortedProducts.length} sản phẩm
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">
                  Sắp xếp:
                </span>

                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`
                      rounded-md border px-3 py-1.5 text-sm font-medium transition-colors
                      ${
                        sort === option.value
                          ? "border-[#c92127] bg-red-50 text-[#c92127]"
                          : "border-gray-300 text-gray-700 hover:border-[#c92127] hover:text-[#c92127]"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danh sách sản phẩm */}
            <div className="mt-4">
              {loading ? (
                // Skeleton khi đang tải
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4.6] animate-pulse rounded-lg bg-[#f2f4f5]"
                    />
                  ))}
                </div>
              ) : pagedProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {pagedProducts.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-lg border border-gray-100 transition hover:shadow-md"
                    >
                      <ProductCard dataItem={item} />
                    </div>
                  ))}
                </div>
              ) : (
                // Danh mục chưa có sản phẩm
                <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
                  <PackageOpen size={56} strokeWidth={1.5} />
                  <p className="text-base">
                    Danh mục này chưa có sản phẩm nào.
                  </p>
                  <Link
                    to="/"
                    className="rounded-lg bg-[#c92127] px-5 py-2 text-sm font-bold text-white hover:bg-[#a30014]"
                  >
                    Về trang chủ
                  </Link>
                </div>
              )}
            </div>

            {/* Phân trang */}
            {!loading && totalPages > 1 && (
              <div className="mt-6 border-t border-gray-200 pt-2">
                <PaginationPage totalPages={totalPages} />
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ProductCategory;
