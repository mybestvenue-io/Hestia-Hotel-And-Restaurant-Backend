const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HotelProperty',
      default: null,
    },
    hotelSlug: {
      type: String,
      default: 'all',
      trim: true,
    },
    hotelName: {
      type: String,
      default: 'All Properties',
      trim: true,
    },
    roomType: {
      type: String,
      default: 'Deluxe Room',
      trim: true,
    },
    roomNumber: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 2999,
    },
    discountPrice: {
      type: Number,
      default: null,
    },
    beds: {
      type: Number,
      default: 1,
    },
    bedType: {
      type: String,
      default: 'Double Bed',
      trim: true,
    },
    guests: {
      type: Number,
      default: 2,
    },
    roomSize: {
      type: String,
      default: '250 sq.ft',
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    gallery: [
      {
        type: String,
      },
    ],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available',
    },
    isFeatured: {
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

roomSchema.index({ hotelSlug: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ isFeatured: 1 });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
