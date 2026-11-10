const { Server } = require("socket.io");
const { verifyToken } = require("../auth/checkAuth");
const userModel = require("../models/user.model");

let io = null;

// Đọc 1 cookie từ header (accessToken là httpOnly nên client JS không đọc được,
// nhưng trình duyệt vẫn tự gửi kèm khi bắt tay socket)
const getCookie = (cookieHeader = "", name) => {
  const part = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
};

const initSocket = (server, origins) => {
  io = new Server(server, { cors: { origin: origins, credentials: true } });

  // Middleware: xác thực trước khi cho kết nối
  io.use(async (socket, next) => {
    try {
      const token = getCookie(socket.handshake.headers.cookie, "accessToken");
      if (!token) return next(new Error("Unauthorized"));

      const decoded = await verifyToken(token);
      const user = await userModel.findById(decoded.id).select("isAdmin isBlocked");
      if (!user || user.isBlocked) return next(new Error("Unauthorized"));

      socket.data.userId = String(user._id);
      socket.data.isAdmin = user.isAdmin;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`); // phòng riêng của mỗi user
    if (socket.data.isAdmin) socket.join("admins"); // phòng chung của admin
  });

  return io;
};

const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload);
const emitToAdmins = (event, payload) => io?.to("admins").emit(event, payload);

module.exports = { initSocket, emitToUser, emitToAdmins };