import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import dayjs from "dayjs";
import { useStore } from "../hooks/useStore";
import { requestCreateMessage, requestGetMessages } from "../config/messageRequest";

// Chống trùng: tin vừa gửi vừa có thể về lại qua socket
const addUnique = (list, msg) => (list.some((m) => m._id === msg._id) ? list : [...list, msg]);

export default function ChatWidget() {
  const { dataUser, socket } = useStore();
  const { pathname } = useLocation();
  const user = dataUser?.user;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Mở khung chat -> tải lịch sử
  useEffect(() => {
    if (!open || !user?._id) return;
    requestGetMessages()
      .then((res) => setMessages(res.metadata))
      .catch(console.error);
  }, [open, user?._id]);

  // Realtime: admin trả lời
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      setMessages((prev) => addUnique(prev, msg));
      if (!openRef.current) setUnread((n) => n + 1);
    };
    socket.on("newMessage", onNewMessage);
    return () => socket.off("newMessage", onNewMessage);
  }, [socket]);

  // Tự cuộn xuống tin mới nhất
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async () => {
    const content = value.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const res = await requestCreateMessage({ content });
      setMessages((prev) => addUnique(prev, res.metadata));
      setValue("");
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  // Chưa đăng nhập, là admin, hoặc đang ở trang admin -> không hiển thị
  if (!user?._id || user.isAdmin || pathname.startsWith("/admin")) return null;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-25 z-50 flex h-[480px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="flex items-center justify-between bg-red-600 px-4 py-3 text-white">
            <h4 className="font-semibold">Hỗ trợ khách hàng</h4>
            <button type="button" onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </header>

          <main className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.length === 0 && (
              <p className="pt-10 text-center text-sm text-gray-400">
                Hãy gửi tin nhắn, cửa hàng sẽ phản hồi sớm nhất.
              </p>
            )}
            {messages.map((msg) => {
              const mine = msg.senderId === user._id;
              return (
                <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-red-600 text-white" : "bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className="mt-1 block text-[10px] opacity-70">
                      {dayjs(msg.createdAt).format("HH:mm DD/MM")}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </main>

          <footer className="flex gap-2 border-t border-gray-200 p-3">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Nhập tin nhắn..."
              maxLength={1000}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !value.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </footer>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setUnread(0);
        }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
      >
        <MessageCircle size={26} />
        {unread > 0 && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-bold text-gray-900">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}