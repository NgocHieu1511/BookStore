const express = require("express");
const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const { authUser } = require("../middleware/authUser");

const cartController = require("../controllers/cart.controller");

router.post("/create", authUser, AsyncHandler(cartController.createCart));
router.put("/update", authUser, AsyncHandler(cartController.updateCart));
router.delete(
  "/delete/:productId",
  authUser,
  AsyncHandler(cartController.deleteProductInCart),
);
router.get("/get", authUser, AsyncHandler(cartController.getCartInUser));
router.put(
  "/update-info",
  authUser,
  AsyncHandler(cartController.updateInfoCart),
);
router.put("/apply-coupon", authUser, AsyncHandler(cartController.applyCoupon));

module.exports = router;
