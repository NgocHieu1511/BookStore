const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const { AsyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const productController = require("../controllers/product.controller");
const { BadRequestError } = require("../core/error.response");

router.post(
  "/create",
  authAdmin,
  upload.array("imagesProduct", 100),
  AsyncHandler(productController.createProduct),
);
router.get("/list", AsyncHandler(productController.getAllProduct));
router.put(
  "/update/:id",
  authAdmin,
  upload.array("imagesProduct", 100),
  AsyncHandler(productController.updateProduct),
);
router.get("/detail/:id", AsyncHandler(productController.getProductById));
router.delete(
  "/delete/:id",
  authAdmin,
  AsyncHandler(productController.deleteProduct),
);

router.get(
  "/list/:idCategory",
  AsyncHandler(productController.getProductByCategory),
);
router.get("/search", AsyncHandler(productController.searchProduct));
router.get("/best-seller", AsyncHandler(productController.getBestSeller));
router.post("/delete-many",authAdmin,AsyncHandler(productController.deleteManyProduct));
// File nhập chỉ đọc trong RAM, không ghi ra ổ đĩa
const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) =>
    /\.(xlsx|csv|json|xml)$/i.test(file.originalname)
      ? cb(null, true)
      : cb(new BadRequestError("Chỉ hỗ trợ file .xlsx, .csv, .json, .xml")),
});

router.get("/export", authAdmin, AsyncHandler(productController.exportProducts));
router.get("/import-template", authAdmin, AsyncHandler(productController.importTemplate));
router.post(
  "/import",
  authAdmin,
  importUpload.single("file"),
  AsyncHandler(productController.importProducts),
);
router.get("/admin/list", authAdmin, AsyncHandler(productController.getAdminProducts));
module.exports = router;
