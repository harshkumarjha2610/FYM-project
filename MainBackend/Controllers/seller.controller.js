const Seller = require('../Models/seller.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator'); 

// Seller Registration
const registerSeller = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      ownerName,
      mobile,
      email,
      password,
      pharmacyName,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      gstNumber,
      drugLicense1,
      drugLicense2,
      description,
    } = req.body;

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ $or: [{ email }, { mobile }, { gstNumber }] });
    if (existingSeller) {
      return res.status(400).json({ message: 'Email, mobile, or GST number already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new seller
    const newSeller = new Seller({
      ownerName,
      mobile,
      email,
      password: hashedPassword,
      pharmacyName,
      location: {
        address,
        city,
        state,
        pincode,
        coordinates: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      },
      gstNumber,
      drugLicense1,
      drugLicense2,
      description,
    });

    await newSeller.save();
    res.status(201).json({ message: 'Seller registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Seller Login
const loginSeller = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // REMOVED .select('-password') here
    const seller = await Seller.findOne({ mobile });
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found.' });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Only exclude password in the response
    const sellerWithoutPassword = seller.toObject();
    delete sellerWithoutPassword.password;

    res.status(200).json({ 
      message: 'Login successful.', 
      token, 
      seller: sellerWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Get Seller Profile
const getSellerProfile = async (req, res) => {
  try {
    console.log('Fetching profile for seller:', req.seller._id);
    
    const seller = await Seller.findById(req.seller._id).select('-password');
    if (!seller) {
      console.error('Seller not found for ID:', req.seller._id);
      return res.status(404).json({ message: 'Seller not found.' });
    }

    const sellerProfile = {
      ...seller.toObject(),
      location: {
        ...seller.location,
        coordinates: {
          latitude: seller.location.coordinates.latitude.toString(),
          longitude: seller.location.coordinates.longitude.toString(),
        },
      },
    };

    console.log('Successfully fetched profile');
    res.status(200).json(sellerProfile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
// Add Shop Photo
const addShopPhoto = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const photo = {
      photoId: new mongoose.Types.ObjectId().toString(),
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };
    const seller = await Seller.findByIdAndUpdate(
      sellerId,
      { $push: { shopPhotos: photo } },
      { new: true }
    ).select('-password');

    // Convert coordinates to strings
    const sellerProfile = {
      ...seller.toObject(),
      location: {
        ...seller.location,
        coordinates: {
          latitude: seller.location.coordinates.latitude.toString(),
          longitude: seller.location.coordinates.longitude.toString(),
        },
      },
    };

    res.status(200).json(sellerProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  getSellerProfile,
  addShopPhoto,
};