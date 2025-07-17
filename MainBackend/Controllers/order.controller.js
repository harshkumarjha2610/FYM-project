const Order = require('../Models/order.model');
const Seller = require('../Models/seller.model');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, prescriptionImage, location } = req.body;
    const buyerId = req.user.id; // From JWT middleware

    // Validate request
    if (!items || items.length === 0 || !totalAmount || !location || !location.coordinates || !location.address) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new order
    const order = new Order({
      buyerId,
      items,
      totalAmount,
      prescriptionImage,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      }
    });

    await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order._id,
        buyerId: order.buyerId,
        items: order.items,
        totalAmount: order.totalAmount,
        prescriptionImage: order.prescriptionImage,
        location: order.location,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get Orders for Buyer
exports.getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orders = await Order.find({ buyerId }).select('-__v').sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get Orders for Seller (based on proximity)
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Find orders within 5km radius of seller's location
    const orders = await Order.find({
      location: {
        $near: {
          $geometry: seller.location,
          $maxDistance: 5000 // 5km in meters
        }
      }
    })
      .select('-__v')
      .populate('buyerId', 'name email mobile')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};