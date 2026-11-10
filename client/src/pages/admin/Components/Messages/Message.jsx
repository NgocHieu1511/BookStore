import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import dayjs from "dayjs";
import { useStore } from "../../../../hooks/useStore";
import {
  requestCreateMessage,
  requestGetConversations,
  requestGetMessages,
} from "../../../../config/messageRequest";

const addUnique = (list, msg) => (list.some((m) => m._id === msg._id) ? list : [...list, msg]);

function Avatar({ user, size = 40 }) {
  const style = { width: size, height: size };
  return user?.avatar ? (
    <img src={user.avatar} alt="" style={style} className="rounded-full object-cover" />
  ) : (
    <div style={style} className="flex items-center justify-center rounded-full bg-red-100 font-semibold text-red-600">
      {user?.fullName?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

export default function Message() {
  const { socket } = useStore();

  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const bottomRef = useRef(null);
  const selectedIdRef = useRef(null);

  // 1. Tải danh sách khách đã nhắn
  useEffect(() => {
    document.title = "Tin nhắn";
    requestGetConversations()
      .then((res) => {
        setConversations(res.metadata);
        if (res.metadata.length > 0) setSelectedId(res.metadata[0]._id);
      })
      .catch(console.error);
  }, []);

  // 2. Đổi khách -> tải tin nhắn của khách đó
  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (!selectedId) return;
    requestGetMessages(selectedId)
      .then((res) => setMessages(res.metadata))
      .catch(console.error);
  }, [selectedId]);

  // 3. Realtime
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      // Khách nhắn: receiverId = null -> khách là senderId. Admin nhắn: khách là receiverId.
      const customerId = msg.receiverId || msg.senderId;

      if (customerId === selectedIdRef.current) {
        setMessages((prev) => addUnique(prev, msg));
      }
      setConversations((prev) => {
        const found = prev.find((c) => c._id === customerId);
        if (!found) return prev; // hội thoại mới sẽ được thêm bởi newUserMessage
        const hasNew = found.hasNew || (!msg.receiverId && customerId !== selectedIdRef.current);
        return [
          { ...found, lastMessage: msg.content, lastAt: msg.createdAt, hasNew },
          ...prev.filter((c) => c._id !== customerId),
        ];
      });
    };

    const onNewUserMessage = (user) => {
      setConversations((prev) =>
        prev.some((c) => c._id === user._id)
          ? prev
          : [{ ...user, lastMessage: "", lastAt: new Date().toISOString(), hasNew: true }, ...prev],
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("newUserMessage", onNewUserMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("newUserMessage", onNewUserMessage);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectConversation = (id) => {
    setSelectedId(id);
    setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, hasNew: false } : c)));
  };

  const handleSend = async () => {
    const content = value.trim();
    if (!content || !selectedId) return;
    try {
      const res = await requestCreateMessage({ content, receiverId: selectedId });
      setMessages((prev) => addUnique(prev, res.metadata));
      setValue("");
    } catch (error) {
      console.error(error);
    }
  };

  const current = conversations.find((c) => c._id === selectedId);

  return (
    <section className="flex h-screen w-full">
      {/* Danh sách khách */}
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
        <h2 className="border-b border-gray-200 px-5 py-5 text-lg font-bold text-gray-800">Tin nhắn</h2>
        {conversations.length === 0 && <p className="p-5 text-sm text-gray-400">Chưa có cuộc trò chuyện nào</p>}
        <ul>
          {conversations.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => selectConversation(c._id)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left transition ${
                  selectedId === c._id ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                <Avatar user={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{c.fullName}</p>
                  <p className={`truncate text-xs ${c.hasNew ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                    {c.lastMessage}
                  </p>
                </div>
                {c.hasNew && <span className="h-2.5 w-2.5 rounded-full bg-red-600" />}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Khung chat */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
        {current ? (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
              <Avatar user={current} />
              <h3 className="font-semibold text-gray-800">{current.fullName}</h3>
            </header>

            <main className="flex-1 space-y-3 overflow-y-auto p-6">
              {messages.map((msg) => {
                const fromCustomer = msg.senderId === selectedId;
                return (
                  <div key={msg._id} className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[60%] rounded-2xl px-4 py-2 text-sm ${
                        fromCustomer ? "bg-white text-gray-800 shadow-sm" : "bg-red-600 text-white"
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

            <footer className="flex gap-3 border-t border-gray-200 bg-white p-4">
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
                disabled={!value.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </footer>
          </>
        ) : (
          <div className="m-auto text-gray-400">Chọn một cuộc trò chuyện</div>
        )}
      </div>
    </section>
  );
}