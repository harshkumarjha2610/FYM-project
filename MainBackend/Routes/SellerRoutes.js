const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

// Import statements ke baad console log
console.log("📦 [Seller Routes] All dependencies imported successfully");

const {
  registerSeller,
  loginSeller,
  getSellerProfile,
  addShopPhoto,
} = require('../Controllers/seller.controller');
const verifySeller = require('../Middleware/verifyseller');

console.log("🎯 [Seller Routes] Controller functions imported:", {
  registerSeller: typeof registerSeller,
  loginSeller: typeof loginSeller,
  getSellerProfile: typeof getSellerProfile,
  addShopPhoto: typeof addShopPhoto
});
console.log("🔐 [Seller Routes] verifySeller middleware imported");

// Configure multer with limits and file type filtering
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    console.log("📁 [Multer] File filter checking file:", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      console.log("❌ [Multer] File type not allowed:", file.mimetype);
      return cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
    
    console.log("✅ [Multer] File type accepted:", file.mimetype);
    cb(null, true);
  },
});

console.log("📸 [Seller Routes] Multer configuration completed with 5MB limit");

const router = express.Router();
console.log("🔗 [Seller Routes] Express router initialized");

// ===================================================================
// Root API Documentation Route
// ===================================================================
router.get('/', (req, res) => {
  console.log("📚 [Seller Routes] API documentation requested");
  console.log("🌐 [Seller Routes] Request details:", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.json({
    success: true,
    message: 'Medicine Delivery - Seller API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: {
          method: 'POST',
          path: '/register',
          description: 'Register a new seller account',
          requiredFields: [
            'ownerName', 'email', 'mobile', 'password',
            'pharmacyName', 'address', 'gstNumber',
            'drugLicense1', 'drugLicense2'
          ]
        },
        login: {
          method: 'POST',
          path: '/login',
          description: 'Authenticate seller',
          requiredFields: ['mobile', 'password']
        }
      },
      profile: {
        getProfile: {
          method: 'GET',
          path: '/profile',
          description: 'Get seller profile (requires authentication)'
        },
        uploadPhoto: {
          method: 'POST',
          path: '/profile/photos',
          description: 'Upload shop photos (requires authentication)',
          fileUpload: 'Single photo (JPEG/PNG, max 5MB)'
        }
      }
    }
  });
  
  console.log("✅ [Seller Routes] Documentation response sent successfully");
});

console.log("📖 [Seller Routes] Documentation route registered: GET /");

// ===================================================================
// Middlewares
// ===================================================================
const handleValidationErrors = (req, res, next) => {
  console.log("🔍 [Validation Middleware] Checking for validation errors...");
  
  const errors = validationResult(req);
  console.log("📋 [Validation Middleware] Validation results:", {
    hasErrors: !errors.isEmpty(),
    errorCount: errors.array().length
  });
  
  if (!errors.isEmpty()) {
    console.log("❌ [Validation Middleware] Validation errors found:");
    errors.array().forEach(error => {
      console.log(`   - ${error.param}: ${error.msg}`);
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => err.msg),
    });
  }
  
  console.log("✅ [Validation Middleware] No validation errors, proceeding...");
  next();
};

console.log("🛡️ [Seller Routes] handleValidationErrors middleware defined");

const validateGSTNumber = (req, res, next) => {
  console.log("🏢 [GST Middleware] Starting GST number validation...");
  
  const { gstNumber } = req.body;
  console.log("📋 [GST Middleware] GST number received:", gstNumber);
  
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
  const upperGST = gstNumber.toUpperCase();
  
  console.log("🔍 [GST Middleware] Testing against regex pattern:", gstRegex.toString());
  console.log("📝 [GST Middleware] Normalized GST:", upperGST);
  
  if (!gstRegex.test(upperGST)) {
    console.log("❌ [GST Middleware] GST number validation failed");
    console.log("❌ [GST Middleware] Expected format: 22AAAAA0000A1Z5");
    
    return res.status(400).json({
      success: false,
      message: 'Invalid GST number format. Expected: 22AAAAA0000A1Z5',
    });
  }
  
  console.log("✅ [GST Middleware] GST number validation passed");
  next();
};

console.log("🏢 [Seller Routes] validateGSTNumber middleware defined");

const uploadPhoto = (req, res, next) => {
  console.log("📸 [Upload Middleware] Starting photo upload process...");
  console.log("📋 [Upload Middleware] Request content type:", req.get('Content-Type'));
  
  upload.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log("❌ [Upload Middleware] Multer error occurred:");
      console.log("   - Error type:", err.code);
      console.log("   - Error message:", err.message);
      
      return res.status(400).json({
        success: false,
        message: `Multer error: ${err.message}`,
      });
    } else if (err) {
      console.log("❌ [Upload Middleware] Custom upload error:");
      console.log("   - Error message:", err.message);
      
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    
    console.log("✅ [Upload Middleware] File upload successful");
    if (req.file) {
      console.log("📁 [Upload Middleware] Uploaded file details:", {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        destination: req.file.destination
      });
    } else {
      console.log("ℹ️ [Upload Middleware] No file uploaded in this request");
    }
    
    next();
  });
};

console.log("📸 [Seller Routes] uploadPhoto middleware defined");

// ===================================================================
// Authentication Routes
// ===================================================================
console.log("🔐 [Seller Routes] Setting up authentication routes...");

router.post(
  '/register',
  [
    body('ownerName')
      .notEmpty().withMessage('Owner name is required')
      .trim(),
    body('email')
      .isEmail().withMessage('Valid email required')
      .normalizeEmail(),
    body('mobile')
      .matches(/^[0-9]{10}$/).withMessage('Mobile must be 10 digits'),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number'),
    body('pharmacyName')
      .notEmpty().withMessage('Pharmacy name is required')
      .trim(),
    body('address')
      .notEmpty().withMessage('Address is required')
      .trim(),
    body('gstNumber')
      .isLength({ min: 15, max: 15 }).withMessage('GST number must be exactly 15 characters')
      .trim(),
    body('drugLicense1')
      .notEmpty().withMessage('Drug License 1 is required')
      .trim(),
    body('drugLicense2')
      .notEmpty().withMessage('Drug License 2 is required')
      .trim(),
    body('latitude')
      .optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  ],
  (req, res, next) => {
    console.log("📝 [Register Route] Registration request received");
    console.log("📋 [Register Route] Request body fields:", Object.keys(req.body));
    console.log("🏪 [Register Route] Pharmacy name:", req.body.pharmacyName);
    console.log("👤 [Register Route] Owner name:", req.body.ownerName);
    console.log("📧 [Register Route] Email:", req.body.email);
    console.log("📱 [Register Route] Mobile:", req.body.mobile);
    next();
  },
  handleValidationErrors,
  validateGSTNumber,
  (req, res, next) => {
    console.log("🎯 [Register Route] All middleware passed, calling registerSeller controller");
    next();
  },
  registerSeller
);

console.log("✅ [Seller Routes] POST /register route registered with full validation chain");

router.post(
  '/login',
  [
    body('mobile')
      .matches(/^[0-9]{10}$/).withMessage('Mobile must be 10 digits'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],
  (req, res, next) => {
    console.log("🔐 [Login Route] Login request received");
    console.log("📱 [Login Route] Mobile:", req.body.mobile);
    console.log("🔑 [Login Route] Password provided:", !!req.body.password);
    next();
  },
  handleValidationErrors,
  (req, res, next) => {
    console.log("🎯 [Login Route] Validation passed, calling loginSeller controller");
    next();
  },
  loginSeller
);

console.log("✅ [Seller Routes] POST /login route registered");

// ===================================================================
// Profile Routes
// ===================================================================
console.log("👤 [Seller Routes] Setting up profile routes...");

router.get('/profile', 
  (req, res, next) => {
    console.log("👤 [Profile Route] Get profile request received");
    console.log("🔑 [Profile Route] Authorization header:", req.headers.authorization ? "Present" : "Missing");
    next();
  },
  verifySeller, 
  (req, res, next) => {
    console.log("✅ [Profile Route] Authentication successful, seller verified");
    console.log("👤 [Profile Route] Seller ID:", req.seller?.id);
    next();
  },
  getSellerProfile
);

console.log("✅ [Seller Routes] GET /profile route registered");

router.post('/profile/photos', 
  (req, res, next) => {
    console.log("📸 [Photo Route] Photo upload request received");
    console.log("🔑 [Photo Route] Authorization header:", req.headers.authorization ? "Present" : "Missing");
    console.log("📋 [Photo Route] Content-Type:", req.get('Content-Type'));
    next();
  },
  verifySeller, 
  (req, res, next) => {
    console.log("✅ [Photo Route] Authentication successful");
    console.log("👤 [Photo Route] Seller ID:", req.seller?.id);
    next();
  },
  uploadPhoto, 
  (req, res, next) => {
    console.log("📸 [Photo Route] File upload middleware completed");
    console.log("📁 [Photo Route] File uploaded:", !!req.file);
    next();
  },
  addShopPhoto
);

console.log("✅ [Seller Routes] POST /profile/photos route registered");

console.log("🎉 [Seller Routes] All routes setup completed successfully");
console.log("📊 [Seller Routes] Route summary:");
console.log("   - GET  / (Documentation)");
console.log("   - POST /register (Seller Registration)");
console.log("   - POST /login (Seller Login)");
console.log("   - GET  /profile (Get Profile - Protected)");
console.log("   - POST /profile/photos (Upload Photos - Protected)");

module.exports = router;

console.log("📤 [Seller Routes] Router exported successfully");
console.log("🚀 [Seller Routes] Seller routes module ready for use");
