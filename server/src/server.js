const express = require("express");
const http = require("http");                               // THÊM
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDB");
const { initSocket } = require("./config/socket");  
const CLIENT_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]; // THÊM         // THÊM
app.use(cookieParser());
app.use(cors({ origin: CLIENT_ORIGINS, credentials: true })); // dùng lại biến
const routes = require("./routes/index.routes");

const { setupMeili } = require("./config/meiliSearch");
connectDB()
  .then(setupMeili)
  .catch((e) => console.error("[Meili] setup lỗi:", e.message));
app.get("/", (req, res) => {
  return res.json({
    message: "ok",
    metadata: { message: "Ok" },
  });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes(app);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || "Lỗi server",
  });
});

const server = http.createServer(app);                       // THÊM
initSocket(server, CLIENT_ORIGINS);                          // THÊM

server.listen(port, () => {                                  // ĐỔI app.listen -> server.listen
  console.log(`Example app listening on port ${port}`);
});
