const express = require("express");
const router = express.Router();
const { AsyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");
const ctrl = require("../controllers/flashSale.controller");

router.get("/", AsyncHandler(ctrl.getFlashSale));
router.post("/", authAdmin, AsyncHandler(ctrl.createFlashSale));
router.delete("/:id", authAdmin, AsyncHandler(ctrl.deleteFlashSale));

module.exports = router;