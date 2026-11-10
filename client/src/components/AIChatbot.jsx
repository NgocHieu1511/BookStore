import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, Send, X } from "lucide-react";
import { useStore } from "../hooks/useStore";
import { requestAskChatbot } from "../config/chatbotRequest";

const GREETING = { sender: "bot", text: "Xin chào! Mình là trợ lý BookStore. Bạn đang tìm sách gì?" };
const fmt = (n) => Number(n).toLocaleString("vi-VN") + "đ";

export default function AIChatbot() {
  const { dataUser } = useStore();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const handleSend = async () => {
    const question = value.trim();
    if (!question || loading) return;

    // Lịch sử gửi lên server, bỏ lời chào đầu tiên
    const history = messages.slice(1).map(({ sender, text }) => ({ sender, text }));

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setValue("");
    setLoading(true);
    try {
      const { metadata } = await requestAskChatbot({ question, history });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: metadata.answer, products: metadata.products },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Ẩn với admin và ở trang admin
  if (dataUser?.user?.isAdmin || pathname.startsWith("/admin")) return null;

  return (
    <>
      {open && (
      <div className="fixed bottom-40 right-6 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-red-600 px-4 py-3 text-white">
            <h4 className="font-semibold">Trợ lý BookStore</h4>
            <button type="button" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </header>

          <main className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg, i) => {
              const mine = msg.sender === "user";
              return (
                <div key={i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-red-600 text-white" : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    {msg.products?.slice(0, 3).map((p) => (
                      <Link
                        key={p._id}
                        to={`/product/${p._id}`}
                        onClick={() => setOpen(false)}
                        className="mt-2 block rounded-lg border border-gray-200 px-2 py-1.5 hover:bg-gray-50"
                      >
                        <span className="line-clamp-1 font-medium text-gray-800">{p.name}</span>
                        <span className="text-xs text-red-600">{fmt(p.finalPrice)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            {loading && <p className="text-sm text-gray-400">Đang soạn câu trả lời...</p>}
            <div ref={bottomRef} />
          </main>

          <footer className="flex gap-2 border-t border-gray-200 p-3">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hỏi về sách, giá, gợi ý..."
              maxLength={500}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !value.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </footer>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-25 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
      >
        <Bot size={26} />
      </button>
    </>
  );
}