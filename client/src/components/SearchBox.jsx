import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import { searchProducts } from "../config/productRequest";
import Highlight from "./Highlight";

function SearchBox({ mobile = false }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("q") || "");
  const [hits, setHits] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const debounced = useDebounce(keyword.trim(), 300);

  useEffect(() => {
    if (debounced.length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController(); // hủy request cũ, tránh kết quả về sai thứ tự
    searchProducts({ q: debounced, limit: 6 }, controller.signal)
      .then((res) => {
        setHits(res.metadata?.hits || []);
        setOpen(true);
      })
      .catch((err) => {
        if (err.code !== "ERR_CANCELED") console.error(err);
      });
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const showDropdown = open && debounced.length >= 2 && hits.length > 0;

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} className="flex w-full">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
          className={`w-full ${mobile ? "h-10" : "h-11"} rounded-l-lg border-2 border-r-0 border-[#c92127] bg-[#f2f4f5] px-4 text-[14px] text-gray-700 outline-none placeholder:text-gray-500`}
        />
        <button
          type="submit"
          className={`flex ${mobile ? "h-10 w-12" : "h-11 w-16"} items-center justify-center rounded-r-lg bg-[#c92127] text-white hover:bg-[#a30014]`}
        >
          <Search size={mobile ? 20 : 22} strokeWidth={2.5} />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {hits.map((item) => (
            <Link
              key={item._id}
              to={`/product/${item._id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
            >
              <img
                src={item.imagesProduct?.[1] || item.imagesProduct?.[0]}
                alt=""
                className="h-14 w-10 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  <Highlight text={item._formatted?.nameProduct ?? item.nameProduct} />
                </p>
                {item.author && (
                  <p className="truncate text-xs text-gray-500">
                    <Highlight text={item._formatted?.author ?? item.author} />
                  </p>
                )}
              </div>
              <span className="shrink-0 text-sm font-bold text-[#c92127]">
                {item.finalPrice?.toLocaleString("vi-VN")}đ
              </span>
            </Link>
          ))}
          <button
            onClick={submit}
            className="w-full border-t border-gray-100 px-3 py-2 text-center text-sm text-[#c92127] hover:bg-gray-50"
          >
            Xem tất cả kết quả cho “{keyword.trim()}”
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchBox;