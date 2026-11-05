const express = require("express");
const router = express.Router();

const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { AsyncHandler } = require("../auth/checkAuth");
const { authUser } = require("../middleware/authUser");
const { BadRequestError } = require("../core/error.response");

const feedbackController = require("../controllers/feedback.controller");

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB / ảnh

// Dùng đường dẫn tuyệt đối để không phụ thuộc thư mục chạy server,
// và tự tạo thư mục nếu chưa có (git không lưu thư mục rỗng).
const UPLOAD_DIR = path.join(__dirname, "../uploads/feedback");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e6) + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_IMAGE_SIZE, files: MAX_IMAGES },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new BadRequestError("Chỉ chấp nhận file ảnh"));
    }
    cb(null, true);
  },
});

// Chuyển lỗi của multer thành lỗi 400 có thông báo tiếng Việt
const uploadImages = (req, res, next) => {
  upload.array("imagesFeedback", MAX_IMAGES)(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return next(
        new BadRequestError(`Chỉ được tải tối đa ${MAX_IMAGES} ảnh, mỗi ảnh không quá 5MB`),
      );
    }
    return next(error);
  });
};

router.post(
  "/create",
  authUser,
  uploadImages,
  AsyncHandler(feedbackController.createFeedback),
);
router.get("/my", authUser, AsyncHandler(feedbackController.getMyFeedbacks));

module.exports = router;
