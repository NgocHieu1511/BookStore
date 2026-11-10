const { GoogleGenAI } = require("@google/genai");
const productSearch = require("./productSearch.service");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

const SYSTEM = `Bạn là trợ lý bán sách của cửa hàng BookStore.
- Chỉ tư vấn dựa trên "Sách liên quan" được cung cấp. Không bịa tên sách, tác giả, giá.
- Nếu danh sách không có sách phù hợp, nói thẳng và gợi ý khách thử từ khóa khác.
- Không khẳng định về tồn kho, thời gian giao hàng hay khuyến mãi nếu không có trong dữ liệu.
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa khoảng 5 câu). Không dùng markdown.`;

const vnd = (n) => Number(n).toLocaleString("vi-VN") + "đ";

// Dữ liệu từ Meili và từ fallback Mongo có hình dạng hơi khác nhau -> chuẩn hóa
const normalize = (h) => {
  const discount = h.discountProduct || 0;
  return {
    _id: String(h._id),
    name: h.nameProduct,
    author: h.author || h.metadata?.author || "",
    discount,
    finalPrice: h.finalPrice ?? Math.round(h.priceProduct * (1 - discount / 100)),
  };
};

async function search(params) {
  try {
    return await productSearch.searchProducts(params);
  } catch (err) {
    console.error("[Chatbot] Meili lỗi, dùng fallback:", err.message);
    return productSearch.fallbackSearch(params);
  }
}

async function findProducts(question) {
  let res = await search({ q: question, page: 1, limit: 5 });
  // Không khớp gì -> gợi ý sách bán chạy
  if (!res.hits.length) {
    res = await search({ q: "", page: 1, limit: 5, sort: "bestseller" });
  }
  return res.hits.map(normalize);
}

// Chuyển lịch sử từ client sang định dạng của Gemini
function toContents(history) {
  const past = history
    .slice(-6)
    .filter((m) => m && typeof m.text === "string" && m.text.trim())
    .map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text.slice(0, 500) }],
    }));
  while (past.length && past[0].role === "model") past.shift(); // lượt đầu phải là user
  return past;
}

async function askChatbot({ question, history = [] }) {
  const products = await findProducts(question);
  const context = products
    .map(
      (p, i) =>
        `${i + 1}. "${p.name}"${p.author ? ` - ${p.author}` : ""} - giá ${vnd(p.finalPrice)}` +
        (p.discount ? ` (đang giảm ${p.discount}%)` : ""),
    )
    .join("\n");

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [
      ...toContents(history),
      {
        role: "user",
        parts: [{ text: `Sách liên quan:\n${context}\n\nCâu hỏi của khách: ${question}` }],
      },
    ],
    config: { systemInstruction: SYSTEM, temperature: 0.4 },
  });

  return {
    answer: response.text || "Xin lỗi, mình chưa trả lời được câu này. Bạn hỏi lại giúp mình nhé.",
    products,
  };
}

module.exports = { askChatbot };