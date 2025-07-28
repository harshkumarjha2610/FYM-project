const jwt = require('jsonwebtoken');
const Seller = require('../Models/seller.model');

const verifySeller = async (req, res, next) => {
  console.log("🔍 [JWT Seller Middleware] Starting seller verification process");
  console.log("📋 [JWT Seller Middleware] Request IP:", req.ip);
  console.log("📋 [JWT Seller Middleware] User Agent:", req.get('User-Agent'));
  
  try {
    // Check for Authorization header existence
    const authHeader = req.header('Authorization');
    console.log("🔑 [JWT Seller Middleware] Authorization header:", authHeader);
    
    if (!authHeader) {
      console.log("❌ [JWT Seller Middleware] No Authorization header present");
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No Authorization header provided.' 
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      console.log("❌ [JWT Seller Middleware] Invalid Authorization header format");
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. Invalid token format.' 
      });
    }
    console.log("✅ [JWT Seller Middleware] Authorization header format is valid");

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    console.log("🎫 [JWT Seller Middleware] Extracted token:", token ? `${token.substring(0, 20)}...` : 'null');
    
    if (!token || token.trim() === '') {
      console.log("❌ [JWT Seller Middleware] Empty token after extraction");
      return res.status(401).json({ 
        success: false,
        message: 'Access denied. No token provided.' 
      });
    }
    console.log("✅ [JWT Seller Middleware] Token extracted successfully");

    // Verify JWT token
    console.log("🔐 [JWT Seller Middleware] Starting JWT verification...");
    console.log("🔑 [JWT Seller Middleware] JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [JWT Seller Middleware] JWT verification successful");
    console.log("📄 [JWT Seller Middleware] Decoded token payload:", {
      sellerId: decoded.sellerId,
      type: decoded.type,
      iat: decoded.iat ? new Date(decoded.iat * 1000) : 'N/A',
      exp: decoded.exp ? new Date(decoded.exp * 1000) : 'N/A'
    });

    // Check token type (if your JWT includes type)
    if (decoded.type && decoded.type !== 'seller') {
      console.log("❌ [JWT Seller Middleware] Invalid token type. Expected 'seller', got:", decoded.type);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token type.' 
      });
    }
    console.log("✅ [JWT Seller Middleware] Token type validation passed");

    // Find seller in database
    const sellerId = decoded.sellerId || decoded.id;
    console.log("🔍 [JWT Seller Middleware] Searching for seller with ID:", sellerId);
    
    const seller = await Seller.findById(sellerId).select('-password');
    console.log("👤 [JWT Seller Middleware] Database query result:", seller ? "Seller found" : "Seller not found");
    
    if (!seller) {
      console.log("❌ [JWT Seller Middleware] Seller not found in database");
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Seller not found.' 
      });
    }
    console.log("✅ [JWT Seller Middleware] Seller found in database");
    console.log("👤 [JWT Seller Middleware] Seller details:", {
      id: seller._id,
      email: seller.email,
      businessName: seller.businessName || seller.name,
      isActive: seller.isActive,
      createdAt: seller.createdAt
    });

    // Check if seller account is active
    if (seller.hasOwnProperty('isActive') && !seller.isActive) {
      console.log("❌ [JWT Seller Middleware] Seller account is deactivated");
      return res.status(401).json({ 
        success: false,
        message: 'Account has been deactivated.' 
      });
    }
    console.log("✅ [JWT Seller Middleware] Seller account status check passed");

    // Attach seller and token to request object
    req.seller = seller;
    req.token = token;
    console.log("📝 [JWT Seller Middleware] Attached seller and token to request object");
    console.log("🎯 [JWT Seller Middleware] Verification completed successfully, proceeding to next middleware");
    
    next();
    
  } catch (err) {
    console.error("💥 [JWT Seller Middleware] Error occurred during verification:");
    console.error("📋 [JWT Seller Middleware] Error name:", err.name);
    console.error("📋 [JWT Seller Middleware] Error message:", err.message);
    console.error("📋 [JWT Seller Middleware] Full error stack:", err.stack);
    
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      console.log("⏰ [JWT Seller Middleware] Token has expired");
      console.log("📅 [JWT Seller Middleware] Token expired at:", new Date(err.expiredAt));
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired.' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      console.log("🚫 [JWT Seller Middleware] Invalid JWT token format or signature");
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token.' 
      });
    }
    
    if (err.name === 'NotBeforeError') {
      console.log("🕐 [JWT Seller Middleware] Token not active yet");
      return res.status(401).json({ 
        success: false,
        message: 'Token not active yet.' 
      });
    }
    
    // Handle database errors
    if (err.name.includes('Mongo') || err.name.includes('mongoose')) {
      console.log("🗄️ [JWT Seller Middleware] Database error");
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error.' 
      });
    }
    
    // Handle any other errors
    console.log("❓ [JWT Seller Middleware] Unknown error during token verification");
    return res.status(401).json({ 
      success: false,
      message: 'Token verification failed.' 
    });
  }
};

module.exports = verifySeller;
