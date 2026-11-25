
const modelBlogs = require('../models/blog.model');
const cloudinary = require('../config/Cloudinary');
const mongoose = require('mongoose');
// Upload ảnh trực tiếp lên Cloudinary bằng buffer
const uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'blogs',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            }
        );

        uploadStream.end(buffer);
    });
};

class BlogsController {

    // Tạo bài viết
    async postBlog(req, res) {
        const { content, nameBlog } = req.body;

        if (!content || !nameBlog || !req.file) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin'
            });
        }

        let uploadedImage;

        try {
            // Upload ảnh lên Cloudinary
            uploadedImage = await uploadImage(req.file.buffer);

            // Tạo Blog và lưu URL ảnh vào MongoDB
            const blog = await modelBlogs.create({
                nameBlog,
                content,
                image: uploadedImage.secure_url,
                publicId: uploadedImage.public_id,
            });

            return res.status(201).json({
                message: 'Tạo blog thành công',
                metadata: blog,
            });

        } catch (error) {
            // Nếu upload thành công nhưng lưu MongoDB thất bại
            // thì xóa ảnh vừa upload để tránh ảnh thừa
            if (uploadedImage?.public_id) {
                await cloudinary.uploader.destroy(
                    uploadedImage.public_id
                ).catch(console.error);
            }

            console.error('Lỗi tạo Blog:', error);

            return res.status(500).json({
                message: 'Lỗi server khi tạo bài viết'
            });
        }
    }

    // Lấy danh sách bài viết
  async getAllBlogs(req, res) {
    try {
        const limit = Math.min(Number(req.query.limit) || 0, 50);

        let query = modelBlogs.find().sort({ createdAt: -1 });
        if (limit) query = query.limit(limit);
        const blogs = await query;

        return res.status(200).json({
            message: 'Lấy danh sách Blog thành công',
            metadata: blogs,
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách Blog:', error);
        return res.status(500).json({ message: 'Lỗi server' });
    }
}

    // Lấy chi tiết bài viết
    async getOneBlog(req, res) {
        try {
            const { idBlog } = req.query;

            if (!idBlog) {
                return res.status(400).json({
                    message: 'Vui lòng cung cấp ID bài viết'
                });
            }

            const blog = await modelBlogs.findById(idBlog);

            if (!blog) {
                return res.status(404).json({
                    message: 'Bài viết không tồn tại'
                });
            }

            return res.status(200).json({
                message: 'Lấy thông tin Blog thành công',
                metadata: blog,
            });

        } catch (error) {
            console.error('Lỗi lấy chi tiết Blog:', error);

            return res.status(500).json({
                message: 'Lỗi server'
            });
        }
    }

    // Xóa bài viết
    async deleteBlog(req, res) {
        try {
            const { idBlog } = req.query;

            if (!idBlog) {
                return res.status(400).json({
                    message: 'Vui lòng cung cấp ID bài viết'
                });
            }

            const dataBlog = await modelBlogs.findById(idBlog);

            if (!dataBlog) {
                return res.status(404).json({
                    message: 'Bài viết không tồn tại'
                });
            }

            // Xóa ảnh trên Cloudinary
            if (dataBlog.publicId) {
                await cloudinary.uploader.destroy(dataBlog.publicId);
            }

            // Xóa bài viết trong MongoDB
            await dataBlog.deleteOne();

            return res.status(200).json({
                message: 'Xóa bài viết thành công',
                metadata: dataBlog,
            });

        } catch (error) {
            console.error('Lỗi xóa Blog:', error);

            return res.status(500).json({
                message: 'Lỗi server'
            });
        }
    }
    // Cập nhật bài viết
async updateBlog(req, res) {
    const { idBlog } = req.query;
    const { nameBlog, content } = req.body;

    if (!idBlog || !mongoose.isValidObjectId(idBlog)) {
        return res.status(400).json({ message: 'ID bài viết không hợp lệ' });
    }

    if (!nameBlog?.trim() || !content?.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    let uploadedImage;

    try {
        const blog = await modelBlogs.findById(idBlog);

        if (!blog) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        const oldPublicId = blog.publicId;

        blog.nameBlog = nameBlog.trim();
        blog.content = content;

        // Chỉ upload ảnh mới khi admin có chọn ảnh
        if (req.file) {
            uploadedImage = await uploadImage(req.file.buffer);
            blog.image = uploadedImage.secure_url;
            blog.publicId = uploadedImage.public_id;
        }

        await blog.save();

        // Lưu DB thành công mới xóa ảnh cũ trên Cloudinary
        if (uploadedImage && oldPublicId) {
            await cloudinary.uploader.destroy(oldPublicId).catch(console.error);
        }

        return res.status(200).json({
            message: 'Cập nhật bài viết thành công',
            metadata: blog,
        });
    } catch (error) {
        // Upload ảnh mới xong mà lưu DB lỗi thì xóa ảnh mới để khỏi thừa
        if (uploadedImage?.public_id) {
            await cloudinary.uploader.destroy(uploadedImage.public_id).catch(console.error);
        }

        console.error('Lỗi cập nhật Blog:', error);
        return res.status(500).json({ message: 'Lỗi server khi cập nhật bài viết' });
    }
}
}

module.exports = new BlogsController();
