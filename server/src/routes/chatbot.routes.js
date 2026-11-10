const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { AsyncHandler } = require("../auth/checkAuth");
const chatbotController = require("../controllers/chatbot.controller");

// Mỗi IP tối đa 15 câu hỏi/phút, tránh bị lạm dụng làm hết quota Gemini
const limiter = rateLimit({ windowMs: 60_000, limit: 15, standardHeaders: true, legacyHeaders: false });

router.post("/ask", limiter, AsyncHandler(chatbotController.ask));

module.exports = router;