const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDB = require("./config/connectDB");
app.use(cookieParser());
app.use(cors((origin = "http://localhost:5173")));
const routes = require("./routes/index.routes");

connectDB();
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
