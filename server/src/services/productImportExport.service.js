const path = require("path");
const { Readable } = require("stream");
const ExcelJS = require("exceljs");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");

const KEYS = [
  "nameProduct", "priceProduct", "discountProduct", "stockProduct",
  "descriptionProduct", "category", "images", "metadata",
];

const FORMATS = {
  xlsx: { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  csv: { mime: "text/csv; charset=utf-8" },
  json: { mime: "application/json" },
  xml: { mime: "application/xml" },
};

// Sản phẩm trong DB -> 1 dòng phẳng
const toRow = (p) => ({
  nameProduct: p.nameProduct,
  priceProduct: p.priceProduct,
  discountProduct: p.discountProduct ?? 0,
  stockProduct: p.stockProduct ?? 0,
  descriptionProduct: p.descriptionProduct,
  category: p.categoryProduct?.nameCategory || "",
  images: (p.imagesProduct || []).join("|"),
  metadata: p.metadata ?? {},
});

// ---------- XUẤT ----------
async function buildFile(rows, format) {
  if (format === "json") {
    return Buffer.from(JSON.stringify(rows, null, 2), "utf8");
  }

  // xlsx / csv / xml: metadata là object nên đổi thành chuỗi JSON
  const flat = rows.map((r) => ({ ...r, metadata: JSON.stringify(r.metadata ?? {}) }));

  if (format === "xml") {
    const builder = new XMLBuilder({ format: true, ignoreAttributes: true });
    const xml = builder.build({ products: { product: flat } });
    return Buffer.from('<?xml version="1.0" encoding="UTF-8"?>\n' + xml, "utf8");
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Products");
  ws.columns = KEYS.map((key) => ({
    header: key,
    key,
    width: key === "descriptionProduct" || key === "images" ? 50 : 20,
  }));
  flat.forEach((r) => ws.addRow(r));
  ws.getRow(1).font = { bold: true };

  if (format === "csv") {
    const csv = await wb.csv.writeBuffer();
    return Buffer.concat([Buffer.from("\uFEFF"), Buffer.from(csv)]); // BOM để Excel đọc đúng tiếng Việt
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

// ---------- ĐỌC FILE NHẬP ----------
const cellValue = (v) => {
  if (v && typeof v === "object") {
    if (v.richText) return v.richText.map((t) => t.text).join("");
    if (v.text !== undefined) return v.text;     // ô có hyperlink
    if (v.result !== undefined) return v.result; // ô có công thức
  }
  return v;
};

function sheetToRows(ws) {
  const headers = [];
  ws.getRow(1).eachCell((cell, col) => {
    headers[col] = String(cellValue(cell.value) ?? "").replace(/^\uFEFF/, "").trim();
  });

  const rows = [];
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    headers.forEach((h, col) => {
      if (h) obj[h] = cellValue(row.getCell(col).value);
    });
    const empty = Object.values(obj).every((v) => v === null || v === undefined || v === "");
    if (!empty) rows.push(obj);
  });
  return rows;
}

async function parseFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === ".json") {
    const data = JSON.parse(file.buffer.toString("utf8"));
    return Array.isArray(data) ? data : data.products || [];
  }

  if (ext === ".xml") {
    // parseTagValue: false -> giữ mọi giá trị là chuỗi, tự ép kiểu ở bước kiểm tra
    const obj = new XMLParser({ parseTagValue: false }).parse(file.buffer.toString("utf8"));
    const list = obj?.products?.product;
    return list ? [].concat(list) : [];
  }

  const wb = new ExcelJS.Workbook();
  if (ext === ".xlsx") {
    await wb.xlsx.load(file.buffer);
    return sheetToRows(wb.worksheets[0]);
  }
  if (ext === ".csv") {
    const ws = await wb.csv.read(Readable.from(file.buffer));
    return sheetToRows(ws);
  }
  throw new Error("Chỉ hỗ trợ .xlsx, .csv, .json, .xml");
}

// ---------- KIỂM TRA 1 DÒNG ----------
const str = (v) => (v === undefined || v === null ? "" : String(v).trim());

function toNumber(v, label, { required = false, integer = false, def = 0 } = {}) {
  if (str(v) === "") {
    if (required) throw new Error(`Thiếu ${label}`);
    return def;
  }
  const n = Number(str(v));
  if (!Number.isFinite(n) || n < 0 || (integer && !Number.isInteger(n))) {
    throw new Error(`${label} không hợp lệ`);
  }
  return n;
}

// Trả về object đúng schema product, hoặc throw Error có thông báo tiếng Việt
function normalizeRow(raw, categoryMap) {
  const nameProduct = str(raw.nameProduct);
  if (!nameProduct) throw new Error("Thiếu tên sản phẩm");

  const descriptionProduct = str(raw.descriptionProduct);
  if (!descriptionProduct) throw new Error("Thiếu mô tả");

  const categoryName = str(raw.category);
  const categoryProduct = categoryMap.get(categoryName.toLowerCase());
  if (!categoryProduct) throw new Error(`Không tìm thấy danh mục "${categoryName}"`);

  const imagesProduct = (Array.isArray(raw.images) ? raw.images : str(raw.images).split(/[|\n]/))
    .map(str)
    .filter(Boolean);
  if (!imagesProduct.length || !imagesProduct.every((u) => /^https?:\/\//i.test(u))) {
    throw new Error("Cần ít nhất 1 URL ảnh hợp lệ (http/https)");
  }

  let metadata = raw.metadata;
  if (typeof metadata === "string") {
    if (metadata.trim() === "") metadata = {};
    else {
      try { metadata = JSON.parse(metadata); }
      catch { throw new Error("metadata không phải JSON hợp lệ"); }
    }
  }

  return {
    nameProduct,
    descriptionProduct,
    categoryProduct,
    imagesProduct,
    metadata: metadata ?? {},
    priceProduct: toNumber(raw.priceProduct, "giá", { required: true }),
    discountProduct: toNumber(raw.discountProduct, "giảm giá"),
    stockProduct: toNumber(raw.stockProduct, "tồn kho", { integer: true }),
  };
}

module.exports = { KEYS, FORMATS, toRow, buildFile, parseFile, normalizeRow };