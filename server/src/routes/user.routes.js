const express = require("express");
const router = express.Router();
const { AsyncHandler } = require("../auth/checkAuth");
const usersController = require("../controllers/user.controller");
const { authUser } = require("../middleware/authUser");
router.post("/register", AsyncHandler(usersController.register));
router.post("/login", AsyncHandler(usersController.login));
router.get("/auth", authUser, AsyncHandler(usersController.getAuth));
router.get("/logout", authUser, AsyncHandler(usersController.logout));
router.post("/forgot-password", AsyncHandler(usersController.forgotPassword));
router.post(
  "/verify-forgot-password",
  AsyncHandler(usersController.verifyForgotPassword),
);
module.exports = router;
