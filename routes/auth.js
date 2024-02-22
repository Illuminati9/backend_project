const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signUp,
  login,
  changePassword,
} = require("../controllers/auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/resetPassword");

const { auth } = require("../middlewares/middleware");

router.post("/sendOTP", sendOTP);
router.post("/signUp", signUp);
router.post("/login", login);
router.post("/changePassword", auth, changePassword);

router.post("/reset-Password-Token", resetPasswordToken);
router.post("/reset-Password", resetPassword);

module.exports = router;