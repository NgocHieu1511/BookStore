const express = require("express");
const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const { authUser, authAdmin } = require("../middleware/authUser");
const messageController = require("../controllers/message.controller");

router.post("/create", authUser, AsyncHandler(messageController.createMessage));
router.get("/list", authUser, AsyncHandler(messageController.getMessages));
router.get("/conversations", authAdmin, AsyncHandler(messageController.getConversations));

module.exports = router;