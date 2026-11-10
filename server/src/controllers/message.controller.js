const mongoose = require("mongoose");
const messageModel = require("../models/message.model");
const userModel = require("../models/user.model");
const { OK, Created } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { emitToUser, emitToAdmins } = require("../config/socket");

const isValidId = (id) => mongoose.isValidObjectId(id);

class MessageController {
  // POST /api/message/create  — body: { content, receiverId? }
  async createMessage(req, res) {
    const content = String(req.body?.content || "").trim();
    if (!content) throw new BadRequestError("Vui lòng nhập nội dung tin nhắn");
    if (content.length > 1000) throw new BadRequestError("Tin nhắn tối đa 1000 ký tự");

    const sender = await userModel.findById(req.user).select("fullName avatar isAdmin");
    if (!sender) throw new NotFoundError("Người dùng không tồn tại");

    // Khách: receiverId luôn = null (bỏ qua body). Admin: bắt buộc chọn khách để trả lời.
    let receiverId = null;
    if (sender.isAdmin) {
      receiverId = req.body?.receiverId;
      if (!isValidId(receiverId)) throw new BadRequestError("Thiếu người nhận");
      const receiver = await userModel.findById(receiverId).select("isAdmin");
      if (!receiver || receiver.isAdmin) throw new NotFoundError("Không tìm thấy khách hàng");
    }

    // Khách nhắn lần đầu -> báo admin thêm hội thoại mới vào danh sách
    const isFirstMessage = !sender.isAdmin && !(await messageModel.exists({ senderId: sender._id }));

    const message = await messageModel.create({ senderId: sender._id, receiverId, content });
    const payload = message.toObject();

    if (sender.isAdmin) {
      emitToUser(receiverId, "newMessage", payload); // tới khách
      emitToAdmins("newMessage", payload); // đồng bộ cho các admin khác
    } else {
      if (isFirstMessage) {
        emitToAdmins("newUserMessage", {
          _id: sender._id,
          fullName: sender.fullName,
          avatar: sender.avatar,
        });
      }
      emitToAdmins("newMessage", payload);
    }

    return new Created({ message: "Gửi tin nhắn thành công", metadata: message }).send(res);
  }

  // GET /api/message/conversations  (admin) — danh sách khách đã nhắn, mới nhất lên đầu
  async getConversations(req, res) {
    const rows = await messageModel.aggregate([
      { $match: { receiverId: null } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $first: "$content" },
          lastAt: { $first: "$createdAt" },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    const users = await userModel
      .find({ _id: { $in: rows.map((r) => r._id) } })
      .select("fullName avatar")
      .lean();
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const data = rows
      .filter((r) => userMap.has(String(r._id)))
      .map((r) => {
        const u = userMap.get(String(r._id));
        return { _id: r._id, fullName: u.fullName, avatar: u.avatar, lastMessage: r.lastMessage, lastAt: r.lastAt };
      });

    return new OK({ message: "Lấy danh sách hội thoại thành công", metadata: data }).send(res);
  }

  // GET /api/message/list?userId=...
  // Khách: luôn lấy hội thoại của chính mình. Admin: lấy hội thoại của userId.
  async getMessages(req, res) {
    const me = await userModel.findById(req.user).select("isAdmin");
    if (!me) throw new NotFoundError("Người dùng không tồn tại");

    let targetId = req.user;
    if (me.isAdmin) {
      targetId = req.query.userId;
      if (!isValidId(targetId)) throw new BadRequestError("Thiếu userId");
    }

    const messages = await messageModel
      .find({ $or: [{ senderId: targetId }, { receiverId: targetId }] })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return new OK({ message: "Lấy tin nhắn thành công", metadata: messages.reverse() }).send(res);
  }
}

module.exports = new MessageController();