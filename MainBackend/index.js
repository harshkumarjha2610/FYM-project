// ===================================================================
// Medicine-Delivery API – Main Entry Point (index.js)
// ===================================================================

// ---------- 1.  Environment & Dependencies ----------
require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./DB/conn');

const app  = express();
const PORT = process.env.PORT || 3000;



// ---------- 2.  MongoDB ----------
connectDB()
  .then(()  => console.log('✅ MongoDB connection successful'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ---------- 3.  Global Middleware ----------
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// ---------- 4.  Health-Check ----------
// app.get('/', (req, res) => {
//   res.json({
//     message:   'Medicine Delivery API is working!',
//     status:    'success',
//     timestamp: new Date().toISOString(),
//     version:   '1.0.0',
//     uptime:    process.uptime()
//   });
// });
// Add this import with your other route imports (around line 30)
let medicineRoutes;

try {
  console.log('📥 Importing medicine routes');
  medicineRoutes = require('./Routes/MedicineRoutes');
  console.log('✅ Medicine routes loaded');
} catch (err) {
  console.error('❌ Failed to load medicine routes:', err.message);
  process.exit(1);
}

// ---------- 5.  Safely Load All Route Files ----------
let buyerRoutes, sellerRoutes;

try {
  console.log('📥 Importing buyer routes');
  buyerRoutes = require('./Routes/UserRoutes');
  console.log('✅ Buyer routes loaded');
} catch (err) {
  console.error('❌ Failed to load buyer routes:', err.message);
  process.exit(1);
}

try {
  console.log('📥 Importing seller routes');
  sellerRoutes = require('./Routes/SellerRoutes');
  console.log('✅ Seller routes loaded');
} catch (err) {
  console.error('❌ Failed to load seller routes:', err.message);
  process.exit(1);
}
// Add this with your other route registrations (around line 80-90)
app.use('/api', (req, res, next) => {
  console.log(`💊 Medicine API accessed: ${req.method} ${req.originalUrl}`);
  next();
}, medicineRoutes);


app.use('/api/buyer', (req, res, next) => {
  console.log(`🛡️  Buyer API accessed: ${req.method} ${req.originalUrl}`);
  next();
}, buyerRoutes);

app.use('/api/seller', (req, res, next) => {
  console.log(`🏪 Seller API accessed: ${req.method} ${req.originalUrl}`);
  next();
}, sellerRoutes);
const orderRoutes = require('./Routes/orderRoutes');


// Orders API
app.use('/api', (req, res, next)=> {
  console.log(`Orders API: ${req.method} ${req.originalUrl}`)
}, orderRoutes)


app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    ip:      req.ip,
    headers: req.headers,
    ts:      new Date().toISOString()
  });
});

app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(mw => {
    if (mw.route) {
      routes.push({ path: mw.route.path, methods: Object.keys(mw.route.methods) });
    } else if (mw.name === 'router') {
      mw.handle.stack.forEach(h => {
        if (h.route) {
          routes.push({ path: h.route.path, methods: Object.keys(h.route.methods) });
        }
      });
    }
  });
  res.json({ routes });
});

// ---------- 8.  404 Handler ----------
// app.use('*', (req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//     method:  req.method,
//     ts:      new Date().toISOString()
//   });
// });

// ---------- 9.  Global Error Handler ----------
app.use((err, req, res, next) => {
  console.error('🚨 Global error:', err.name, err.message);
  console.error(err.stack);

  let status = 500;
  let body   = { success: false, message: err.message, ts: new Date().toISOString() };

  if (err.name === 'ValidationError') {
    status = 400;
    body.errors = Object.values(err.errors).map(e => e.message);
  }
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    body.message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }
  if (err.message.includes('CORS')) {
    status = 403;
    body.message = 'CORS policy violation';
  }

  res.status(status).json(body);
});

// ---------- 10.  Graceful Shutdown ----------
['SIGTERM', 'SIGINT'].forEach(sig =>
  process.on(sig, () => {
    console.log(`⚠️  ${sig} received`);
    process.exit(0);
  })
);

process.on('unhandledRejection', (reason) => {
  console.error('🚨 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception:', err);
  process.exit(1);
});

// ---------- 11.  Start Server ----------
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('❌ Server start error:', err);
    process.exit(1);
  }
  console.log('\n🎉 SERVER STARTED SUCCESSFULLY 🎉');
  console.log(`📍 Local:   http://localhost:${PORT}`);
  console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
});
// In your main index.js
  // Keep existing
  // Add user alias
