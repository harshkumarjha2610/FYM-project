const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    // Basic Information
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    pharmacyName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Business Information
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: 'Invalid GST number format'
      }
    },
    drugLicense1: {
      type: String,
      required: true,
      trim: true,
    },
    drugLicense2: {
      type: String,
      required: true,
      trim: true,
    },

    // Location Information
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        latitude: {
          type: String,
          required: true,
        },
        longitude: {
          type: String,
          required: true,
        },
      },
      pincode: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
    },

    // Shop Photos
    shopPhotos: [{
      photoId: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      fileUrl: {
        type: String,
        required: true,
      },
      fileSize: {
        type: Number,
      },
      mimeType: {
        type: String,
        default: 'image/jpeg',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
      trim: true,
    },
    verifiedAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    // Document Status
    documentsStatus: {
      gstVerified: {
        type: Boolean,
        default: false,
      },
      drugLicense1Verified: {
        type: Boolean,
        default: false,
      },
      drugLicense2Verified: {
        type: Boolean,
        default: false,
      },
      shopPhotosVerified: {
        type: Boolean,
        default: false,
      },
    },

    // Business Details
    businessHours: {
      monday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      tuesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      wednesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      thursday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      friday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      saturday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: '09:00' },
        closeTime: { type: String, default: '21:00' },
      },
      sunday: {
        isOpen: { type: Boolean, default: false },
        openTime: { type: String, default: '10:00' },
        closeTime: { type: String, default: '18:00' },
      },
    },

    // Additional Information
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    specializations: [{
      type: String,
      trim: true,
    }],
    
    // Rating and Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      trim: true,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },

    // Performance Metrics
    metrics: {
      totalOrders: {
        type: Number,
        default: 0,
      },
      completedOrders: {
        type: Number,
        default: 0,
      },
      cancelledOrders: {
        type: Number,
        default: 0,
      },
      averageResponseTime: {
        type: Number, // in minutes
        default: 0,
      },
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
    },

    // FCM Token for Push Notifications
    fcmTokens: [{
      token: String,
      deviceType: {
        type: String,
        enum: ['android', 'ios'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],

    // Reset Password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Email Verification
    emailVerificationToken: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: Date,

    // Phone Verification
    phoneVerificationOTP: String,
    phoneVerificationExpires: Date,
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerifiedAt: Date,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
sellerSchema.index({ email: 1 });
sellerSchema.index({ mobile: 1 });
sellerSchema.index({ gstNumber: 1 });
sellerSchema.index({ isVerified: 1 });
sellerSchema.index({ verificationStatus: 1 });
sellerSchema.index({ isActive: 1 });
sellerSchema.index({ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 });

// Virtual for full address
sellerSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.state} - ${this.location.pincode}`;
});

// Virtual for completion percentage
sellerSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  let total = 10;
  
  if (this.ownerName) completed++;
  if (this.pharmacyName) completed++;
  if (this.email) completed++;
  if (this.mobile) completed++;
  if (this.gstNumber) completed++;
  if (this.drugLicense1) completed++;
  if (this.drugLicense2) completed++;
  if (this.location.address) completed++;
  if (this.shopPhotos.length > 0) completed++;
  if (this.description) completed++;
  
  return Math.round((completed / total) * 100);
});

// Virtual for shop photo count
sellerSchema.virtual('shopPhotoCount').get(function() {
  return this.shopPhotos.length;
});

// Methods
sellerSchema.methods.addShopPhoto = function(photoData) {
  this.shopPhotos.push({
    photoId: photoData.photoId,
    fileName: photoData.fileName,
    fileUrl: photoData.fileUrl,
    fileSize: photoData.fileSize,
    mimeType: photoData.mimeType,
  });
  return this.save();
};

sellerSchema.methods.removeShopPhoto = function(photoId) {
  this.shopPhotos = this.shopPhotos.filter(photo => photo.photoId !== photoId);
  return this.save();
};

sellerSchema.methods.updateLastActive = function() {
  this.metrics.lastActiveAt = new Date();
  return this.save();
};

sellerSchema.methods.isOnline = function() {
  const now = new Date();
  const lastActive = this.metrics.lastActiveAt;
  const timeDiff = now - lastActive;
  return timeDiff < 5 * 60 * 1000; // 5 minutes
};

// Static methods
sellerSchema.statics.findByLocation = function(lat, lng, radius = 10) {
  // This would work with proper geospatial indexing
  // For now, it's a placeholder for location-based queries
  return this.find({
    isActive: true,
    isVerified: true,
  });
};

sellerSchema.statics.findVerified = function() {
  return this.find({
    isVerified: true,
    isActive: true,
    verificationStatus: 'verified',
  });
};

// Pre-save middleware
sellerSchema.pre('save', function(next) {
  // Update verification status based on document verification
  if (this.documentsStatus.gstVerified && 
      this.documentsStatus.drugLicense1Verified && 
      this.documentsStatus.drugLicense2Verified && 
      this.documentsStatus.shopPhotosVerified) {
    this.verificationStatus = 'verified';
    this.isVerified = true;
    if (!this.verifiedAt) {
      this.verifiedAt = new Date();
    }
  }
  
  next();
});

// Export model
module.exports = mongoose.model("Seller", sellerSchema);