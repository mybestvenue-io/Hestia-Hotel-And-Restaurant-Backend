const Admin = require('../model/adminModel');
const Hotel = require('../model/Hotel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { sendOTPEmail, sendHotelApprovalEmail } = require('../common/emailSender');
const { uploadProfileImage } = require('../common/multerConfig');

// Register a new admin
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;
        let profile_picture = null;
        
        if (req.file) {
            const uploadResult = await uploadProfileImage(req.file);
            profile_picture = uploadResult.url;
        }
        
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ name, email, password: hashedPassword, phone, address, profile_picture });
        const admin = await newAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully', admin });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // update lastLogin timestamp
        try {
            admin.lastLogin = new Date();
            await admin.save();
        } catch (error) {
            console.warn('Failed to update lastLogin:', error);
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
        res.status(200).json({
            msg: 'Admin logged in successfully', token, data: {
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                address: admin.address,
                profile_picture: admin.profile_picture,
                role: admin.role,
                id: admin._id,
            }
        });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Admin Forgot Password 
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to database
        admin.otp = otp;
        admin.otpExpiry = otpExpiry;
        await admin.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, admin.name, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Verify OTP
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        if (!admin.otp || admin.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > admin.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Resend OTP
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update OTP in database
        admin.otp = otp;
        admin.otpExpiry = otpExpiry;
        await admin.save();

        // Send OTP email
        const emailSent = await sendOTPEmail(email, admin.name, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        res.status(200).json({ message: 'New OTP sent to your email' });
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Update Password
const updatePassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }

        // Verify OTP again before password update
        if (!admin.otp || admin.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > admin.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        admin.password = hashedPassword;
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Admin not found' });
        }
        // Verify OTP again before password reset
        if (!admin.otp || admin.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        if (new Date() > admin.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password and clear OTP
        admin.password = hashedPassword;
        admin.otp = undefined;
        admin.otpExpiry = undefined;
        await admin.save();
        res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }


}

// Get pending hotels for approval
const getPendingHotels = async (req, res) => {
    try {
        const pendingHotels = await Hotel.find({ 
            status: 'pending', 
            isOtpVerified: true 
        }).select('-password -otp -otpExpiry');
        
        res.status(200).json({ 
            message: 'Pending hotels retrieved successfully', 
            hotels: pendingHotels 
        });
    } catch (error) {
        console.error('Error getting pending hotels:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Approve hotel
const approveHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        if (!hotel.isOtpVerified) {
            return res.status(400).json({ message: 'Hotel email not verified' });
        }
        
        hotel.status = 'active';
        await hotel.save();
        
        // Send approval email
        await sendHotelApprovalEmail(hotel.email, hotel.name);
        
        res.status(200).json({ message: 'Hotel approved successfully' });
    } catch (error) {
        console.error('Error approving hotel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Reject hotel
const rejectHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { reason } = req.body;
        
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: 'Hotel not found' });
        }
        
        hotel.status = 'inactive';
        hotel.rejectionReason = reason || 'No reason provided';
        await hotel.save();
        
        res.status(200).json({ message: 'Hotel rejected successfully' });
    } catch (error) {
        console.error('Error rejecting hotel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Admin Profile get 
const getAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }
      const admin = await Admin.findById(adminId)
      .select("name email profile_picture address phone")
      .lean();

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin profile found successfully",
      admin
    });

  } catch (error) {
    console.error("Error getting admin profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Edit Admin Profile  
const editAdminProfile = async (req, res) => {
  try {
    const { adminId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }

    // ✅ Allow only safe fields (prevent mass update)
    const allowedFields = [
      "name",
    //   "email",
      "phone",
      "address",
      "profile_picture"
    ];

    const payload = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    });

    // Handle profile picture upload
    if (req.file) {
      try {
        const uploadResult = await uploadProfileImage(req.file);
        console.log('Upload result:', uploadResult);
        console.log('Full URL:', uploadResult.url);
        payload.profile_picture = uploadResult.url;
      } catch (error) {
        console.error('Error uploading profile image:', error);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
    }

    // ❌ If nothing to update
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // ✅ Update admin
    const admin = await Admin.findByIdAndUpdate(
      adminId,
      payload,
      {
        new: true,
        runValidators: true,
        context: "query"
      }
    ).select("name email phone address profile_picture");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully",
      admin
    });

  } catch (error) {
    console.error("Error editing admin profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 

    

module.exports = {
    registerAdmin,
    loginAdmin,
    forgotPassword,
    verifyOTP,
    resendOTP,
    updatePassword,
    resetPassword,
    getPendingHotels,
    approveHotel,
    rejectHotel,
    getAdminProfile,
    editAdminProfile
};