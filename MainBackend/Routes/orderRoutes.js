const express = require('express');
console.log('✅ Express module imported successfully');

const router = express.Router();
console.log('🚀 Express router instance created');

const orderController = require('../Controllers/order.controller');
console.log('📦 Order controller imported successfully');
console.log('🔍 Available controller methods:', Object.keys(orderController));

// POST route for creating orders
console.log('📝 Setting up POST /orders route...');
router.post('/orders', orderController.createOrder);
console.log('✅ POST /orders route registered successfully');

// GET route for fetching orders by buyer ID
console.log('📝 Setting up GET /orders/buyer/:buyerId route...');
router.get('/orders/buyer/:buyerId', orderController.getOrdersByBuyer);
console.log('✅ GET /orders/buyer/:buyerId route registered successfully');

// GET route for fetching single order by ID
console.log('📝 Setting up GET /orders/:orderId route...');
router.get('/orders/:orderId', orderController.getOrderById);
console.log('✅ GET /orders/:orderId route registered successfully');

// PATCH route for updating order status
console.log('📝 Setting up PATCH /orders/:orderId/status route...');
router.patch('/orders/:orderId/status', orderController.updateOrderStatus);
console.log('✅ PATCH /orders/:orderId/status route registered successfully');

console.log('🎯 All order routes configured successfully');
console.log('📋 Route summary:');
console.log('   - POST   /orders');
console.log('   - GET    /orders/buyer/:buyerId');
console.log('   - GET    /orders/:orderId');
console.log('   - PATCH  /orders/:orderId/status');

module.exports = router;
console.log('📤 Order router exported successfully');
