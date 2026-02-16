const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
     email: {
    type: String,
    // required: true,
    unique: true,
    index: true, 
  },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        // required: true,
    },
    address: {
        type: String,
        // required: true,
    },
    profile_picture: {
        type: String,
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin'],
        default: 'admin',
    },
    lastLogin:{
        type: Date,
        default: Date.now,
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    }
},{ timestamps: true } );

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
