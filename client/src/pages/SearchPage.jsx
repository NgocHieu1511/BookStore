import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import PaginationPage from "../components/Pagination/Pagination";
import { searchProducts } from "../config/productRequest";

const PAGE_SIZE = 20;
const SORT_OPTIONS = [
  { value: "", label: "Liên quan nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy" },
  { value: "price-asc", label: "Giá thấp → cao" },
  { value: "price-desc", label: "Giá cao → thấp" },
];
const EMPTY = { hits: [], total: 0, totalPages: 0 };

function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "";
  const page = parseInt(params.get("page"), 10) || 1;
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    searchProducts({ q, sort, page, limit: PAGE_SIZE }, controller.signal)
      .then((res) => setData(res.metadata ?? EMPTY))
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") {
          console.error(err);
          setData(EMPTY);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    window.scrollTo({ top: 0 });
    return () => controller.abort();
  }, [q, sort, page]);

  const changeSort = (value) => {
    const next = new URLSearchParams(params);
    if (value) next.set("sort", value);
    else next.delete("sort");
    next.delete("page"); // đổi sắp xếp thì về trang 1
    setParams(next);
  };

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1230px] px-3 py-4 md:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold">
            Kết quả cho “{q}” {!loading && <span className="font-normal text-gray-500">({data.total} sản phẩm)</span>}
          </h1>
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="py-20 text-center text-gray-500">Đang tìm kiếm...</p>
        ) : data.hits.length === 0 ? (
          <p className="py-20 text-center text-gray-500">
            Không tìm thấy sản phẩm nào phù hợp. Hãy thử từ khóa khác.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {data.hits.map((item) => (
                <ProductCard key={item._id} dataItem={item} />
              ))}
            </div>
            <PaginationPage totalPages={data.totalPages} />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default SearchPage;