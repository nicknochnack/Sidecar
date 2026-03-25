const express = require("express");
const passport = require("passport");
const authController = require("../controller/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.login
);
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  authController.me
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
