const express = require("express");
const router = express.Router();

const { AsyncHandler } = require("../auth/checkAuth");
const { authAdmin } = require("../middleware/authUser");

const statisticalController = require("../controllers/statistical.controller");

router.get(
  "/overview",
  authAdmin,
  AsyncHandler(statisticalController.getOverview)
);

module.exports = router;