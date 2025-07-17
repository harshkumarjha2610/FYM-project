const express = require("express");
const {
  registerBuyer,
  loginBuyer,
  getBuyerProfile,
} = require("../Controllers/user.controller");
const verifyBuyer = require("../Middleware/verifybuyer");

const router = express.Router();

// Public Routes
router.post("/register", registerBuyer);
router.post("/login", loginBuyer);

// Protected Route
router.get("/profile", verifyBuyer, getBuyerProfile);

module.exports = router;
