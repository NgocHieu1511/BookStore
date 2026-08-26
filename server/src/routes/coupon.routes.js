const express = require("express");
const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const couponController = require("../controllers/coupon.controller");

router.post("/create", authAdmin, AsyncHandler(couponController.createCoupon));
router.get("/list", authAdmin, AsyncHandler(couponController.getAllCoupon));
router.put(
  "/update/:id",
  authAdmin,
  AsyncHandler(couponController.updateCoupon),
);
router.delete(
  "/delete/:id",
  authAdmin,
  AsyncHandler(couponController.deleteCoupon),
);
// router.get("/get", authAdmin, AsyncHandler(couponController.getCoupons));
// router.put(
//   "/update-info",
//   authAdmin,
//   AsyncHandler(couponController.updateCouponInfo),
// );
// router.put(
//   "/apply-coupon",
//   authAdmin,
//   AsyncHandler(couponController.applyCoupon),
// );

module.exports = router;
