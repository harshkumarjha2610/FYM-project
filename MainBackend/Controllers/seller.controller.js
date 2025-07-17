const Seller = require("../Models/seller.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Seller Registration
const registerSeller = async (req, res) => {
  try {
    const {
      name,
      mobile,
      email,
      password,
      pharmacyName,
      pharmacyAddress,
      latitude,
      longitude,
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ $or: [{ email }, { mobile }] });
    if (existingSeller) {
      return res.status(400).json({ message: "Email or Mobile already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const newSeller = new Seller({
      name,
      mobile,
      email,
      password: hashedPassword,
      pharmacyName,
      pharmacyAddress,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON format
      },
    });

    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Seller Login
const loginSeller = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const seller = await Seller.findOne({ mobile });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful.", token, seller });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// Get Seller Profile
const getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.sellerId;
    const seller = await Seller.findById(sellerId).select("-password");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    res.status(200).json({ seller });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  getSellerProfile,
};
