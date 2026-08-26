const mongoose = require("mongoose");
// Dòng này dùng để đọc các biến môi trường từ file .env và nạp chúng vào process.env.
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Kết nối MongoDB thành công");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
