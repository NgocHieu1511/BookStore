const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageModel = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // null = khách gửi cho cửa hàng (mọi admin đều thấy)
    // có giá trị = admin trả lời cho khách đó
    receiverId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

messageModel.index({ senderId: 1, createdAt: 1 });
messageModel.index({ receiverId: 1, createdAt: 1 });

module.exports = mongoose.model("messages", messageModel);