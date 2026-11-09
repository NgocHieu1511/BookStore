const { Meilisearch } = require("meilisearch");
require("dotenv").config();

const client = new Meilisearch({
  host: process.env.MEILI_HOST || "http://127.0.0.1:7700",
  apiKey: process.env.MEILI_MASTER_KEY,
});

const PRODUCT_INDEX = "products";

async function setupMeili() {
  // Phải khai báo primaryKey rõ ràng, vì doc có cả "_id" lẫn "categoryId"
  // nên Meilisearch không tự đoán được khóa chính.
  try {
    await client.createIndex(PRODUCT_INDEX, { primaryKey: "_id" });
  } catch (_) {}

  await client.index(PRODUCT_INDEX).updateSettings({
    // Thứ tự = độ ưu tiên: khớp tên sách quan trọng hơn khớp mô tả
    searchableAttributes: [
      "nameProduct", "author", "publishingHouse",
      "company", "categoryName", "descriptionProduct",
    ],
    filterableAttributes: ["categoryId", "finalPrice"],
    sortableAttributes: ["finalPrice", "countBuy", "createdAtTs"],
    // 6 rule mặc định + ưu tiên sách bán chạy khi điểm liên quan bằng nhau
    rankingRules: [
      "words", "typo", "proximity", "attribute", "sort", "exactness",
      "countBuy:desc",
    ],
    typoTolerance: { minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    // Synonyms là một chiều, muốn hai chiều thì khai báo cả hai
    synonyms: {
      sgk: ["sách giáo khoa"],
      "sách giáo khoa": ["sgk"],
    },
  });
}

module.exports = { client, PRODUCT_INDEX, setupMeili };