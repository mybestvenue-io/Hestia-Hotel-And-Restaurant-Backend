const mongoose = require('mongoose');

const hotelPropertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    accommodationInfo: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 2999,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 150,
    },
    image: {
      type: String, // primary banner / featured image URL
      default: '',
    },
    gallery: [
      {
        type: String,
      },
    ],
    location: {
      area: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      distance: { type: String, default: '' },
      accessibility: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    amenities: [
      {
        name: { type: String, required: true },
        icon: { type: String, default: 'WiFi' },
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    restaurant: {
      name: { type: String, default: '' },
      description: { type: String, default: '' },
      cuisine: [{ type: String }],
      timings: { type: String, default: '' },
      image: { type: String, default: '' },
    },
    reviews: [
      {
        name: { type: String },
        rating: { type: Number, default: 5 },
        comment: { type: String },
        date: { type: String },
      },
    ],
    policies: {
      checkIn: { type: String, default: '1:00 PM' },
      checkOut: { type: String, default: '11:00 AM' },
      cancellation: {
        type: String,
        default: 'Free cancellation up to 24 hours before check-in',
      },
      rules: [{ type: String }],
    },
    contact: {
      phone: { type: String, default: '+91 8130622279' },
      email: { type: String, default: 'info@hestiahotels.com' },
      address: { type: String, default: '' },
    },
    mapUrl: {
      type: String,
      default: '',
    },
    nearbyPlaces: [
      {
        type: String,
      },
    ],
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

hotelPropertySchema.index({ isActive: 1, order: 1 });

const HotelProperty = mongoose.model('HotelProperty', hotelPropertySchema);

module.exports = HotelProperty;
