const mongoose = require("mongoose");
const productModel = require("../models/product.model");
const { client, PRODUCT_INDEX } = require("../config/meiliSearch");
require("../models/category.model"); 
const index = () => client.index(PRODUCT_INDEX);

// Chuyển document Mongo thành document để index
const toDocument = (p) => {
  const meta = p.metadata || {};
  const discount = p.discountProduct || 0;
  return {
    _id: String(p._id),
    nameProduct: p.nameProduct,
    author: meta.author || "",
    publishingHouse: meta.publishingHouse || "",
    company: meta.company || "",
    descriptionProduct: (p.descriptionProduct || "").slice(0, 1000),
    categoryId: String(p.categoryProduct?._id || p.categoryProduct || ""),
    categoryName: p.categoryProduct?.nameCategory || "",
    priceProduct: p.priceProduct,
    discountProduct: discount,
    finalPrice: Math.round(p.priceProduct * (1 - discount / 100)),
    countBuy: p.countBuy || 0,
    imagesProduct: p.imagesProduct || [],
    createdAtTs: p.createdAt ? new Date(p.createdAt).getTime() : 0,
  };
};

async function indexProduct(id) {
  const p = await productModel
    .findById(id).populate("categoryProduct", "nameCategory").lean();
  if (p) await index().addDocuments([toDocument(p)]); // upsert theo _id
}

async function removeProduct(id) {
  await index().deleteDocument(String(id));
}

async function syncAll({ reset = false } = {}) {
  if (reset) await index().deleteAllDocuments();
  const BATCH = 500;
  let batch = [];
  const cursor = productModel
    .find().populate("categoryProduct", "nameCategory").lean().cursor();
  for await (const p of cursor) {
    batch.push(toDocument(p));
    if (batch.length === BATCH) {
      await index().addDocuments(batch);
      batch = [];
    }
  }
  if (batch.length) await index().addDocuments(batch);
}

const SORTS = {
  newest: ["createdAtTs:desc"],
  bestseller: ["countBuy:desc"],
  "price-asc": ["finalPrice:asc"],
  "price-desc": ["finalPrice:desc"],
};

async function searchProducts({ q, page, limit, categoryId, sort, minPrice, maxPrice }) {
  const filter = [];
  // Chỉ nhận ObjectId hợp lệ và số, tránh người dùng chèn filter bậy
  if (categoryId && mongoose.isValidObjectId(categoryId)) {
    filter.push(`categoryId = "${categoryId}"`);
  }
  if (minPrice !== undefined && Number.isFinite(Number(minPrice))) {
    filter.push(`finalPrice >= ${Number(minPrice)}`);
  }
  if (maxPrice !== undefined && Number.isFinite(Number(maxPrice))) {
    filter.push(`finalPrice <= ${Number(maxPrice)}`);
  }

  const res = await index().search(String(q || "").trim().slice(0, 100), {
    page: Math.max(1, Number(page) || 1),
    hitsPerPage: Math.min(50, Math.max(1, Number(limit) || 20)),
    filter,
    sort: SORTS[sort],
    attributesToHighlight: ["nameProduct", "author"],
    // Dùng marker thay vì thẻ HTML để client không phải dùng dangerouslySetInnerHTML
    highlightPreTag: "[[",
    highlightPostTag: "]]",
  });

  return {
    hits: res.hits,
    total: res.totalHits,
    totalPages: res.totalPages,
    page: res.page,
  };
}

// Dự phòng khi Meilisearch bị tắt: tìm tạm bằng regex trên Mongo
async function fallbackSearch({ q, page, limit }) {
  const safe = String(q || "").trim().slice(0, 100)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cond = safe ? { nameProduct: { $regex: safe, $options: "i" } } : {};
  const l = Math.min(50, Math.max(1, Number(limit) || 20));
  const p = Math.max(1, Number(page) || 1);
  const [hits, total] = await Promise.all([
    productModel.find(cond).skip((p - 1) * l).limit(l).lean(),
    productModel.countDocuments(cond),
  ]);
  return { hits, total, totalPages: Math.ceil(total / l), page: p };
}

module.exports = { indexProduct, removeProduct, syncAll, searchProducts, fallbackSearch };