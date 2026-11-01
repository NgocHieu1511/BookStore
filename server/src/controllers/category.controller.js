const categoryModel = require("../models/category.model");
const cloudinary = require("../config/Cloudinary");
const { Created, OK } = require("../core/success.response");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const productModel = require("../models/product.model");

const fs = require("fs/promises");

const getPublicId = require("../utils/getPublicId");
class CategoryController {
  async createCategory(req, res) {
    const { path, filename } = req.file;
    const { nameCategory } = req.body;
    if (!nameCategory || !path || !filename) {
      await fs.unlink(path);
      throw new BadRequestError("Thiếu thông tin danh mục");
    }
    const { url } = await cloudinary.uploader.upload(path, {
      folder: "categorys",
      resource_type: "image",
    });

    const newCategory = await categoryModel.create({
      nameCategory,
      imageCategory: url || filename,
    });

    await fs.unlink(path);

    return new Created({
      message: "Tạo danh mục thành công",
      metadata: newCategory,
    }).send(res);
  }
 async getAllCategory(req, res) {
    // Lấy danh sách tất cả danh mục
    const categories = await categoryModel.find();

    // Tính số lượng sản phẩm thuộc từng danh mục
    const categoriesWithProductCount = await Promise.all(
        categories.map(async (category) => {
            // Đếm sản phẩm có categoryProduct bằng ID danh mục
            const lengthProduct = await productModel.countDocuments({
                categoryProduct: category._id,
            });

            // Trả về danh mục kèm số lượng sản phẩm
            return {
                ...category.toObject(),
                lengthProduct,
            };
        })
    );

    // Trả dữ liệu về frontend
    return new OK({
        message: "Lấy danh mục thành công",
        metadata: categoriesWithProductCount,
    }).send(res);
}

  async deleteCategory(req, res) {
    const { id } = req.params;

    if (!id) {
      throw new BadRequestError("Thiếu thông tin danh mục");
    }

    const findCategory = await categoryModel.findById(id);

    if (!findCategory) {
      throw new NotFoundError("Danh mục không tồn tại");
    }

    await cloudinary.uploader.destroy(getPublicId(findCategory.imageCategory));

    await findCategory.deleteOne();

    return new OK({
      message: "Xóa danh mục thành công",
      metadata: findCategory,
    }).send(res);
  }
}
module.exports = new CategoryController();
