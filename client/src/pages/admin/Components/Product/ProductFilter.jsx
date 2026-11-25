import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RotateCcw, Search } from "lucide-react";

import { listCategory } from "../../../../config/categoryRequest";

const FILTER_KEYS = ["search", "category", "stock", "discount", "minPrice", "maxPrice", "sort"];

const FIELD =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 " +
  "focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function ProductFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  // Ô nhập chữ/số giữ ở state riêng, chỉ đẩy lên URL khi bấm Lọc hoặc Enter
  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  useEffect(() => {
    listCategory()
      .then((res) => setCategories(Array.isArray(res?.metadata) ? res.metadata : []))
      .catch(() => setCategories([]));
  }, []);

  // Cập nhật tham số trên URL, đổi bộ lọc thì về trang 1
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    next.delete("page");
    setSearchParams(next);
  };

  const applyText = () =>
    update({ search: keyword.trim(), minPrice, maxPrice });

  const reset = () => {
    const next = new URLSearchParams(searchParams);
    [...FILTER_KEYS, "page"].forEach((key) => next.delete(key));
    setSearchParams(next);
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilter = FILTER_KEYS.some((key) => searchParams.get(key));
  const onEnter = (e) => e.key === "Enter" && applyText();

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
      <input
        className={`${FIELD} w-56`}
        placeholder="Tìm theo tên sản phẩm"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={onEnter}
      />

      <select
        className={FIELD}
        value={searchParams.get("category") || ""}
        onChange={(e) => update({ category: e.target.value })}
      >
        <option value="">Tất cả danh mục</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>{c.nameCategory}</option>
        ))}
      </select>

      <select
        className={FIELD}
        value={searchParams.get("stock") || ""}
        onChange={(e) => update({ stock: e.target.value })}
      >
        <option value="">Mọi tình trạng kho</option>
        <option value="in">Còn hàng</option>
        <option value="low">Sắp hết (≤ 10)</option>
        <option value="out">Hết hàng</option>
      </select>

      <select
        className={FIELD}
        value={searchParams.get("discount") || ""}
        onChange={(e) => update({ discount: e.target.value })}
      >
        <option value="">Giảm giá: tất cả</option>
        <option value="true">Đang giảm giá</option>
        <option value="false">Không giảm giá</option>
      </select>

      <div className="flex items-center gap-2">
        <input
          type="number" min="0" className={`${FIELD} w-28`} placeholder="Giá từ"
          value={minPrice} onChange={(e) => setMinPrice(e.target.value)} onKeyDown={onEnter}
        />
        <span className="text-gray-400">–</span>
        <input
          type="number" min="0" className={`${FIELD} w-28`} placeholder="Giá đến"
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} onKeyDown={onEnter}
        />
      </div>

      <select
        className={FIELD}
        value={searchParams.get("sort") || ""}
        onChange={(e) => update({ sort: e.target.value })}
      >
        <option value="">Mới nhất</option>
        <option value="oldest">Cũ nhất</option>
        <option value="price_asc">Giá tăng dần</option>
        <option value="price_desc">Giá giảm dần</option>
        <option value="best_seller">Bán chạy nhất</option>
        <option value="stock_asc">Tồn kho ít nhất</option>
      </select>

      <button
        type="button"
        onClick={applyText}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-95"
      >
        <Search size={16} /> Lọc
      </button>

      {hasFilter && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 active:scale-95"
        >
          <RotateCcw size={14} /> Xóa lọc
        </button>
      )}
    </div>
  );
}

export default ProductFilter;