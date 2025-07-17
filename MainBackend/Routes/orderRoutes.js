const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/order.controller');
const authMiddleware = require('../Middleware/auth.middleware'); // Assuming you have auth middleware

// Buyer routes
router.post('/create', authMiddleware.authenticateBuyer, orderController.createOrder);
router.get('/buyer', authMiddleware.authenticateBuyer, orderController.getBuyerOrders);

// Seller routes
router.get('/seller', authMiddleware.authenticateSeller, orderController.getSellerOrders);

module.exports = router;