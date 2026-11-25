const mongoose = require("mongoose");
const paymentModel = require("../models/payment.model");
const cloudinary = require("../config/Cloudinary");
const { Created, OK } = require("../core/success.response");
const { NotFoundError, BadRequestError } = require("../core/error.response");

const getPublicId = require("../utils/getPublicId");
const productSearch = require("../services/productSearch.service");

const productModel = require("../models/product.model");
// const feedbackModel = require("../models/feedback.model");
const { attachRatings, getFeedbackByProduct } = require("../utils/feedbackHelper");
// Lỗi search không được làm hỏng thao tác của admin
const safe = (promise) => promise.catch((e) => console.error("[Meili]", e.message));
const categoryModel = require("../models/category.model");
const io = require("../services/productImportExport.service");

const MAX_IMPORT_ROWS = 500;
const LOW_STOCK = 10; // dưới hoặc bằng số này là "sắp hết hàng"

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Đọc số từ query, rỗng hoặc sai thì trả null
const toNum = (v) => (v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { priceProduct: 1 },
  price_desc: { priceProduct: -1 },
  best_seller: { countBuy: -1 },
  stock_asc: { stockProduct: 1 },
};

class ProductController {
  async createProduct(req, res) {
    const dataImages = req.files;
    const {
      nameProduct,
      priceProduct,
      discountProduct,
      stockProduct,
      descriptionProduct,
      categoryProduct,
      metadata,
    } = req.body;
    if (
      !nameProduct ||
      !priceProduct ||
      !discountProduct ||
      !stockProduct ||
      !descriptionProduct ||
      !categoryProduct ||
      !dataImages ||
      !metadata
    ) {
      throw new BadRequestError("Thiếu thông tin sản phẩm");
    }

    let imagesProduct = [];

    for (const image of dataImages) {
      const { path, filename } = image;
      const { url } = await cloudinary.uploader.upload(path, {
        folder: "products",
        resource_type: "image",
      });
      imagesProduct.push(url || filename);
    }

    const newProduct = await productModel.create({
      nameProduct,
      priceProduct,
      discountProduct,
      stockProduct,
      descriptionProduct,
      categoryProduct,
      metadata: JSON.parse(metadata),
      imagesProduct,
    });
    safe(productSearch.indexProduct(newProduct._id));

    return new Created({
      message: "Tạo sản phẩm thành công",
      metadata: newProduct,
    }).send(res);
  }

  async getAllProduct(req, res) {
    const products = await productModel.find().populate('categoryProduct', 'nameCategory').lean();
    const data = await attachRatings(products);
    return new OK({
      message: "Lấy danh sách sản phẩm thành công",
      metadata: products,
    }).send(res);
  }

  async updateProduct(req, res) {
    const { id } = req.params;
    const {
      nameProduct,
      priceProduct,
      discountProduct,
      stockProduct,
      descriptionProduct,
      categoryProduct,
      metadata,
      oldImagesProduct,
    } = req.body;

    const dataImages = req.files;

    if (
      !id ||
      !nameProduct ||
      !priceProduct ||
      !discountProduct ||
      !stockProduct ||
      !descriptionProduct ||
      !categoryProduct ||
      !metadata ||
      !oldImagesProduct
    ) {
      throw new BadRequestError("Thiếu thông tin sản phẩm");
    }

    const findProduct = await productModel.findById(id);
    if (!findProduct) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }

    let imagesProduct = [];

    if (dataImages && dataImages.length > 0) {
      for (const image of dataImages) {
        const { path, filename } = image;
        const { url } = await cloudinary.uploader.upload(path, {
          folder: "products",
          resource_type: "image",
        });
        imagesProduct.push(url || filename);
      }
    }

    const parserOldImages = oldImagesProduct
      ? JSON.parse(oldImagesProduct)
      : [];

    const finalImages = [...parserOldImages, ...imagesProduct];

    const parserMetadata = metadata ? JSON.parse(metadata) : undefined;

    const updateProduct = await productModel.findByIdAndUpdate(
      id,
      {
        nameProduct,
        priceProduct,
        discountProduct,
        stockProduct,
        descriptionProduct,
        categoryProduct,
        metadata: parserMetadata,
        imagesProduct: finalImages,
      },
      { new: true },
    );

    if (!updateProduct) {
      throw new NotFoundError("Cập nhật sản phẩm thất bại");
    }
    safe(productSearch.indexProduct(id));

    return new OK({
      message: "Cập nhật thông tin sản phẩm thành công",
      metadata: updateProduct,
    }).send(res);
  }

  async getProductById(req, res) {
  const { id } = req.params;

  const product = await productModel
    .findById(id)
    .populate("categoryProduct", "nameCategory");

  // Kiểm tra null TRƯỚC khi dùng product._id
  if (!product) {
    throw new NotFoundError("Sản phẩm không tồn tại");
  }

  const feedbackUser = await getFeedbackByProduct(product._id);

  // Sản phẩm liên quan: cùng danh mục, loại trừ sản phẩm hiện tại
  const relatedProducts = await productModel
    .find({
      categoryProduct: product.categoryProduct?._id || product.categoryProduct,
      _id: { $ne: product._id },
    })
    .sort({ countBuy: -1 })
    .limit(10);

  return new OK({
    message: "Lấy thông tin sản phẩm thành công",
    metadata: { product, feedbackUser, relatedProducts },
  }).send(res);
}

  async deleteProduct(req, res) {
    const { id } = req.params;
    if (!id) {
      throw new BadRequestError("Thiếu thông tin sản phẩm");
    }

    const findProduct = await productModel.findById(id);
    if (!findProduct) {
      throw new NotFoundError("Sản phẩm không tồn tại");
    }

    for (const image of findProduct.imagesProduct) {
      await cloudinary.uploader.destroy(getPublicId(image));
    }

    await findProduct.deleteOne();
    safe(productSearch.removeProduct(id));

    return new OK({
      message: "Xóa sản phẩm thành công",
      metadata: findProduct,
    }).send(res);
  }

  async getProductByCategory(req, res) {
    const { idCategory } = req.params;

    let product = [];
    if (idCategory) {
      product = await productModel.find({ categoryProduct: idCategory });
    } else {
      product = await productModel.find();
    }

    return new OK({
      message: "Lấy sản phẩm theo danh mục thành công",
      metadata: product,
    }).send(res);
  }
  async searchProduct(req, res) {
  const { q, page, limit, category, sort, minPrice, maxPrice } = req.query;
  const params = {
    q: typeof q === "string" ? q : "",
    page, limit, categoryId: category, sort, minPrice, maxPrice,
  };
  let data;
  try {
    data = await productSearch.searchProducts(params);
  } catch (err) {
    console.error("[Meili] search lỗi, dùng fallback:", err.message);
    data = await productSearch.fallbackSearch(params);
  }
  return new OK({ message: "Tìm kiếm sản phẩm thành công", metadata: data }).send(res);
}
// Top bán chạy trong 7 ngày gần nhất (có thể lọc theo danh mục)
async getBestSeller(req, res) {
  const { category } = req.query;
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (category && !mongoose.Types.ObjectId.isValid(category)) {
    throw new BadRequestError("Danh mục không hợp lệ");
  }

  // Chỉ tính đơn đã giao/hoàn thành, giống logic cộng countBuy ở payment.controller
  const pipeline = [
    { $match: { status: { $in: ["delivered", "completed"] }, createdAt: { $gte: since } } },
    { $unwind: "$products" },
    { $group: { _id: "$products.productId", sold: { $sum: "$products.quantity" } } },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    ...(category
      ? [{ $match: { "product.categoryProduct": new mongoose.Types.ObjectId(category) } }]
      : []),
    { $sort: { sold: -1 } },
    { $limit: limit },
  ];

  const weekly = await paymentModel.aggregate(pipeline);
  let data = weekly.map((w) => ({ ...w.product, sold: w.sold }));

  // Dự phòng: chưa có đơn nào trong tuần -> lấy theo tổng đã bán
  if (data.length === 0) {
    const filter = category ? { categoryProduct: category } : {};
    const fallback = await productModel
      .find(filter)
      .sort({ countBuy: -1 })
      .limit(limit)
      .lean();
    data = fallback.map((p) => ({ ...p, sold: p.countBuy || 0 }));
  }

  return new OK({ message: "Lấy sách bán chạy thành công", metadata: data }).send(res);
}
  // ============ XÓA NHIỀU SẢN PHẨM ============
  async deleteManyProduct(req, res) {
    const { ids } = req.body;

    // 1. Kiểm tra dữ liệu đầu vào
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError("Vui lòng chọn ít nhất một sản phẩm để xóa");
    }

    const uniqueIds = [...new Set(ids.map(String))]; // loại id trùng

    if (uniqueIds.length > 100) {
      throw new BadRequestError("Chỉ được xóa tối đa 100 sản phẩm mỗi lần");
    }
    if (!uniqueIds.every((id) => mongoose.isValidObjectId(id))) {
      throw new BadRequestError("Danh sách sản phẩm không hợp lệ");
    }

    // 2. Tìm các sản phẩm thực sự tồn tại
    const products = await productModel.find({ _id: { $in: uniqueIds } });
    if (products.length === 0) {
      throw new NotFoundError("Không tìm thấy sản phẩm nào để xóa");
    }

    // 3. Xóa trong DB trước
    const { deletedCount } = await productModel.deleteMany({
      _id: { $in: products.map((p) => p._id) },
    });

    // 4. Xóa ảnh trên Cloudinary (lỗi cũng không làm hỏng kết quả)
    const publicIds = [];
    for (const product of products) {
      for (const image of product.imagesProduct || []) {
        try {
          publicIds.push(getPublicId(image));
        } catch {
          // ảnh không phải URL Cloudinary -> bỏ qua
        }
      }
    }
    for (let i = 0; i < publicIds.length; i += 100) {
      try {
        await cloudinary.api.delete_resources(publicIds.slice(i, i + 100));
      } catch (error) {
        console.error("Lỗi xóa ảnh Cloudinary:", error.message);
      }
    }

    return new OK({
      message: `Đã xóa ${deletedCount} sản phẩm`,
      metadata: {
        deletedCount,
        requested: uniqueIds.length,
        notFound: uniqueIds.length - products.length,
      },
    }).send(res);
  }
    // GET /api/product/export?format=xlsx|csv|json|xml
  async exportProducts(req, res) {
    const format = String(req.query.format || "xlsx").toLowerCase();
    if (!io.FORMATS[format]) throw new BadRequestError("Định dạng không hỗ trợ");

    const products = await productModel
      .find()
      .populate("categoryProduct", "nameCategory")
      .lean();

    const buffer = await io.buildFile(products.map(io.toRow), format);
    res.setHeader("Content-Type", io.FORMATS[format].mime);
    res.setHeader("Content-Disposition", `attachment; filename="products.${format}"`);
    return res.send(buffer);
  }

  // GET /api/product/import-template?format=xlsx — file mẫu có 1 dòng ví dụ
  async importTemplate(req, res) {
    const format = String(req.query.format || "xlsx").toLowerCase();
    if (!io.FORMATS[format]) throw new BadRequestError("Định dạng không hỗ trợ");

    const sample = {
      nameProduct: "Tên sách ví dụ",
      priceProduct: 120000,
      discountProduct: 0,
      stockProduct: 50,
      descriptionProduct: "Mô tả sách",
      category: "Nhập đúng tên một danh mục đã có",
      images: "https://res.cloudinary.com/.../a.jpg|https://res.cloudinary.com/.../b.jpg",
      metadata: {},
    };
    const buffer = await io.buildFile([sample], format);
    res.setHeader("Content-Type", io.FORMATS[format].mime);
    res.setHeader("Content-Disposition", `attachment; filename="products-template.${format}"`);
    return res.send(buffer);
  }

  // POST /api/product/import  (field file)
  async importProducts(req, res) {
    if (!req.file) throw new BadRequestError("Vui lòng chọn file");

    let rawRows;
    try {
      rawRows = await io.parseFile(req.file);
    } catch (e) {
      throw new BadRequestError(`Không đọc được file: ${e.message}`);
    }
    if (!rawRows.length) throw new BadRequestError("File không có dòng dữ liệu nào");
    if (rawRows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestError(`Mỗi lần nhập tối đa ${MAX_IMPORT_ROWS} dòng`);
    }

    const categories = await categoryModel.find().lean();
    const categoryMap = new Map(categories.map((c) => [c.nameCategory.trim().toLowerCase(), c._id]));
    const existingNames = new Set(
      (await productModel.find({}, "nameProduct").lean()).map((p) => p.nameProduct.trim().toLowerCase()),
    );

    const docs = [];
    const failed = [];
    rawRows.forEach((raw, i) => {
      const line = i + 2; // dòng 1 là tiêu đề, khớp số dòng trong Excel
      try {
        const doc = io.normalizeRow(raw, categoryMap);
        const key = doc.nameProduct.toLowerCase();
        if (existingNames.has(key)) throw new Error("Đã tồn tại sản phẩm trùng tên");
        existingNames.add(key); // chặn trùng ngay trong chính file
        docs.push(doc);
      } catch (e) {
        failed.push({ row: line, name: String(raw?.nameProduct ?? ""), reason: e.message });
      }
    });

    if (docs.length) {
      await productModel.insertMany(docs);
      safe(productSearch.syncAll()); // cập nhật lại MeiliSearch, lỗi search không làm hỏng việc nhập
    }

    return new OK({
      message: `Đã nhập ${docs.length}/${rawRows.length} sản phẩm`,
      metadata: { total: rawRows.length, inserted: docs.length, failed },
    }).send(res);
  }
    // GET /api/product/admin/list  — lọc + sắp xếp + phân trang cho trang quản lý
  async getAdminProducts(req, res) {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const { search, category, stock, discount, sort } = req.query;

    const filter = {};

    if (search?.trim()) {
      filter.nameProduct = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        throw new BadRequestError("Danh mục không hợp lệ");
      }
      filter.categoryProduct = category;
    }

    if (stock === "out") filter.stockProduct = { $lte: 0 };
    if (stock === "in") filter.stockProduct = { $gt: 0 };
    if (stock === "low") filter.stockProduct = { $gt: 0, $lte: LOW_STOCK };

    if (discount === "true") filter.discountProduct = { $gt: 0 };
    if (discount === "false") filter.discountProduct = { $not: { $gt: 0 } }; // gồm cả sản phẩm cũ chưa có field

    const minPrice = toNum(req.query.minPrice);
    const maxPrice = toNum(req.query.maxPrice);
    if (minPrice !== null || maxPrice !== null) {
      filter.priceProduct = {};
      if (minPrice !== null) filter.priceProduct.$gte = minPrice;
      if (maxPrice !== null) filter.priceProduct.$lte = maxPrice;
    }

    // _id là điều kiện phụ để thứ tự ổn định, tránh một sản phẩm xuất hiện ở 2 trang
    const sortBy = { ...(SORTS[sort] || SORTS.newest), _id: -1 };

    const [products, total] = await Promise.all([
      productModel
        .find(filter)
        .populate("categoryProduct", "nameCategory")
        .sort(sortBy)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      productModel.countDocuments(filter),
    ]);

    return new OK({
      message: "Lấy danh sách sản phẩm thành công",
      metadata: {
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    }).send(res);
  }
}

module.exports = new ProductController();
