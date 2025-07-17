const Buyer = require("../Models/buyer.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Buyer
exports.registerBuyer = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).json({ message: "Buyer already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new buyer
    const buyer = new Buyer({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    // Save buyer to DB
    await buyer.save();

    // Generate JWT
    const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send response
    res.status(201).json({
      message: "Buyer registered successfully",
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        mobile: buyer.mobile,
      },
      token,
    });
  } catch (err) {
    console.error("Error in registerBuyer:", err);
    res.status(500).json({ message: "Error registering buyer", error: err.message });
  }
};

// Login Buyer
exports.loginBuyer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find buyer by email
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, buyer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign({ id: buyer._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Send response
    res.status(200).json({
      message: "Login successful",
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        mobile: buyer.mobile,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

// Get Buyer Profile
exports.getBuyerProfile = async (req, res) => {
  try {
    const buyer = await Buyer.findById(req.user.id).select("-password");
    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found" });
    }

    res.status(200).json({ buyer });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};
