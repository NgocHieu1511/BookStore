const { OK } = require("../core/success.response");
const { BadRequestError } = require("../core/error.response");
const chatbotService = require("../services/chatbot.service");

class ChatbotController {
  // POST /api/chatbot/ask — body: { question, history? }
  async ask(req, res) {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    if (!question || question.length > 500) throw new BadRequestError("Câu hỏi không hợp lệ");
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    const metadata = await chatbotService.askChatbot({ question, history });
    return new OK({ message: "Thành công", metadata }).send(res);
  }
}

module.exports = new ChatbotController();