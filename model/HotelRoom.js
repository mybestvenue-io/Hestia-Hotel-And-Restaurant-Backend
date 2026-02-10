const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true }, 
    price: { type: Number, required: true },

    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
