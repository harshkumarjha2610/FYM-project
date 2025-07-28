const Order = require('../Models/order.js');
const Seller = require('../Models/seller.model.js'); // assuming this model exists
const mongoose = require('mongoose');

// Create a new order
exports.createOrder = async (req, res) => {
  console.log('🚀 Starting createOrder function');
  console.log('📨 Request body received:', JSON.stringify(req.body, null, 2));
  
  try {
    const { buyerId, items, totalAmount, prescriptionImage, location } = req.body;
    console.log('✅ Successfully destructured request body');
    console.log('👤 Buyer ID:', buyerId);
    console.log('📦 Items:', JSON.stringify(items, null, 2));
    console.log('💰 Total Amount:', totalAmount);
    console.log('📋 Prescription Image:', prescriptionImage ? 'Present' : 'Not provided');
    console.log('📍 Location:', JSON.stringify(location, null, 2));

    console.log('🔍 Starting search for nearest seller...');
    console.log('📍 Searching from coordinates:', location.coordinates);
    
    // Find nearest seller who is accepting orders
    const nearestSeller = await Seller.findOne({
      isAcceptingOrders: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location.coordinates
          },
          $maxDistance: 10000 // adjust based on delivery range in meters
        }
      }
    });

    console.log('🔍 Seller search completed');
    console.log('🏪 Nearest seller found:', nearestSeller ? 'YES' : 'NO');
    
    if (nearestSeller) {
      console.log('🏪 Seller details:', {
        id: nearestSeller._id,
        name: nearestSeller.name || 'N/A',
        isAcceptingOrders: nearestSeller.isAcceptingOrders
      });
    }

    if (!nearestSeller) {
      console.log('❌ No sellers available - sending error response');
      return res.status(400).json({ message: 'No sellers are accepting orders currently' });
    }

    console.log('📝 Creating new order object...');
    const newOrder = new Order({
      buyerId,
      items,
      totalAmount,
      prescriptionImage,
      location,
      assignedSellerId: nearestSeller._id // Optional if you're storing this in Order
    });

    console.log('📝 Order object created:', JSON.stringify(newOrder.toObject(), null, 2));
    console.log('💾 Attempting to save order to database...');
    
    await newOrder.save();
    
    console.log('✅ Order saved successfully to database');
    console.log('📤 Sending success response...');

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    console.log('✅ Success response sent');
    
  } catch (error) {
    console.error('❌ Error in createOrder function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.log('📤 Sending error response...');
    
    res.status(500).json({ message: 'Internal server error' });
    console.log('❌ Error response sent');
  }
};

// Get all orders for a buyer
exports.getOrdersByBuyer = async (req, res) => {
  console.log('🚀 Starting getOrdersByBuyer function');
  console.log('📨 Request params:', JSON.stringify(req.params, null, 2));
  
  try {
    const buyerId = req.params.buyerId;
    console.log('👤 Extracted buyer ID:', buyerId);
    console.log('🔍 Searching for orders for buyer:', buyerId);

    const orders = await Order.find({ buyerId }).sort({ createdAt: -1 });
    
    console.log('🔍 Database query completed');
    console.log('📦 Number of orders found:', orders.length);
    console.log('📦 Orders data:', JSON.stringify(orders, null, 2));
    console.log('📤 Sending orders response...');

    res.status(200).json(orders);
    console.log('✅ Orders response sent successfully');
    
  } catch (error) {
    console.error('❌ Error in getOrdersByBuyer function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.log('📤 Sending error response...');
    
    res.status(500).json({ message: 'Internal server error' });
    console.log('❌ Error response sent');
  }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
  console.log('🚀 Starting getOrderById function');
  console.log('📨 Request params:', JSON.stringify(req.params, null, 2));
  
  try {
    const orderId = req.params.orderId;
    console.log('🆔 Extracted order ID:', orderId);
    console.log('🔍 Searching for order with ID:', orderId);

    const order = await Order.findById(orderId);
    
    console.log('🔍 Database query completed');
    console.log('📦 Order found:', order ? 'YES' : 'NO');
    
    if (order) {
      console.log('📦 Order data:', JSON.stringify(order.toObject(), null, 2));
    }

    if (!order) {
      console.log('❌ Order not found - sending 404 response');
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('📤 Sending order response...');
    res.status(200).json(order);
    console.log('✅ Order response sent successfully');
    
  } catch (error) {
    console.error('❌ Error in getOrderById function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.log('📤 Sending error response...');
    
    res.status(500).json({ message: 'Internal server error' });
    console.log('❌ Error response sent');
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  console.log('🚀 Starting updateOrderStatus function');
  console.log('📨 Request params:', JSON.stringify(req.params, null, 2));
  console.log('📨 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log('🆔 Extracted order ID:', orderId);
    console.log('📊 Extracted status:', status);

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    console.log('✅ Valid statuses defined:', validStatuses.join(', '));
    console.log('🔍 Checking if provided status is valid...');
    
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status provided:', status);
      console.log('📤 Sending invalid status error response...');
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    console.log('✅ Status validation passed');
    console.log('🔄 Attempting to update order in database...');

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    console.log('🔄 Database update completed');
    console.log('📦 Updated order found:', order ? 'YES' : 'NO');
    
    if (order) {
      console.log('📦 Updated order data:', JSON.stringify(order.toObject(), null, 2));
    }

    if (!order) {
      console.log('❌ Order not found during update - sending 404 response');
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('📤 Sending success update response...');
    res.status(200).json({ message: 'Order status updated', order });
    console.log('✅ Update response sent successfully');
    
  } catch (error) {
    console.error('❌ Error in updateOrderStatus function:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.log('📤 Sending error response...');
    
    res.status(500).json({ message: 'Internal server error' });
    console.log('❌ Error response sent');
  }
};
