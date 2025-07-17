const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./DB/conn");
const buyerRoutes = require("./Routes/UserRoutes");
const sellerRoutes = require("./Routes/SellerRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is working!");
});

// Routes
app.use("/api/buyer", buyerRoutes);
app.use("/api/seller", sellerRoutes);

// Error handler middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});
app.get("/api/test", (req, res) => {
  res.send("Server is working!");
});
// Start server
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on PORT ${PORT}`);
});
