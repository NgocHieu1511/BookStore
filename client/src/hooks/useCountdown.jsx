import { useEffect, useState } from "react";

export default function useCountdown(endAt) {
  const calc = () => Math.max(0, new Date(endAt) - Date.now());
  const [left, setLeft] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  const s = Math.floor(left / 1000);
  return { left, h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}