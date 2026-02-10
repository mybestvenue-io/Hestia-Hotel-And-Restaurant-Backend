const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,

    profile_picture: String,

    role: {
      type: String,
      enum: ["super_admin", "admin", "hotel"],
      default: "hotel",
    },

    status: {
      type: String,
      enum: ["active", "inactive","blocked","pending"],
      default: "pending",
    },
    isOtpVerified: { type: Boolean, default: false },
    rejectionReason: String,

    lastLogin: { type: Date, default: Date.now },
    otp: String,
    otpExpiry: Date,
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
