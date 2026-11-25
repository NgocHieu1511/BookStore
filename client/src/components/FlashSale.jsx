import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import useCountdown from "../hooks/useCountdown";
import { getFlashSale } from "../config/flashSaleRequest";

const pad = (n) => String(n).padStart(2, "0");

function Timer({ endAt, onEnd }) {
  const { left, h, m, s } = useCountdown(endAt);
  useEffect(() => { if (left === 0) onEnd(); }, [left, onEnd]);   // hết giờ -> tải lại
  return (
    <div className="flex items-center gap-1">
      <span className="mr-2 text-sm font-semibold">Kết thúc trong</span>
      {[pad(h), pad(m), pad(s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="rounded bg-[#2e3132] px-2 py-1 text-sm font-bold text-white">{v}</span>
          {i < 2 && <b>:</b>}
        </span>
      ))}
    </div>
  );
}

export default function FlashSale() {
  const [products, setProducts] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await getFlashSale();
      setProducts(res.metadata || []);
    } catch (e) {
      console.error("Flash sale:", e);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (products.length === 0) return null;   // không có flash sale thì ẩn cả khối

  const endAt = products[0].dateEnd;        // server đã sort theo dateEnd tăng dần

  return (
    <section className="overflow-hidden rounded-lg bg-[#FCDCDC] shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#e4bdba] p-4 md:p-5">
        <h2 className="flex items-center gap-2 text-2xl font-black italic text-[#a30014] md:text-3xl">
          <Zap size={30} fill="currentColor" /> FLASH SALE
        </h2>
        <Timer key={endAt} endAt={endAt} onEnd={load} />
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-5">
        {products.map((item) => (
          <ProductCard key={item._id} dataItem={item} />
        ))}
      </div>
    </section>
  );
}