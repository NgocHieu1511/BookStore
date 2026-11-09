const express = require('express');
const router = express.Router();

const { authAdmin } = require("../middleware/authUser");

const multer = require('multer');

const controllerBlogs = require('../controllers/blogs.controller');

// Lưu ảnh tạm trong RAM
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
        }
    }
});

// Tạo bài viết
router.post(
    '/create',
    authAdmin,
    upload.single('image'),
    controllerBlogs.postBlog
);

// Lấy danh sách bài viết
router.get('/list', controllerBlogs.getAllBlogs);

// Lấy chi tiết bài viết
router.get('/get-one-blog', controllerBlogs.getOneBlog);

// Xóa bài viết
router.delete('/delete', authAdmin, controllerBlogs.deleteBlog);

module.exports = router;