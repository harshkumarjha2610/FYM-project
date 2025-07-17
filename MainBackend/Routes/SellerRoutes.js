const express = require("express");
const router = express.Router();
const {
  registerSeller,
  loginSeller,
  getSellerProfile,
} = require("../Controllers/seller.controller");

const verifySeller = require("../Middleware/verifyseller");

// @route   POST /api/seller/register
router.post("/register", registerSeller);

// @route   POST /api/seller/login
router.post("/login", loginSeller);

// @route   GET /api/seller/profile
router.get("/profile", verifySeller, getSellerProfile);

module.exports = router;
