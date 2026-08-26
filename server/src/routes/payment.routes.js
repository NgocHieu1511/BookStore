const express = require("express");
const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const { authAdmin, authUser } = require("../middleware/authUser");

const paymentController = require("../controllers/payment.controller");

router.post("/create", authUser, AsyncHandler(paymentController.createPayment));
router.get("/vnpay-callback", AsyncHandler(paymentController.vnpayCallback));
router.get("/momo-callback", AsyncHandler(paymentController.momoCallback));

// router.get('/order/:orderId', authUser, asyncHandler(paymentController.getPaymentById));

router.get(
  "/admin/list",
  authAdmin,
  AsyncHandler(paymentController.getPaymentsAdmin),
);
router.put(
  "/admin/update/:orderId",
  authAdmin,
  AsyncHandler(paymentController.updatePayment),
);

module.exports = router;
