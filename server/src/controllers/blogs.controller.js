
const modelBlogs = require('../models/blog.model');
const cloudinary = require('../config/Cloudinary');

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
            const blogs = await modelBlogs.find().sort({
                createdAt: -1
            });

            return res.status(200).json({
                message: 'Lấy danh sách Blog thành công',
                metadata: blogs,
            });

        } catch (error) {
            console.error('Lỗi lấy danh sách Blog:', error);

            return res.status(500).json({
                message: 'Lỗi server'
            });
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
}

module.exports = new BlogsController();
