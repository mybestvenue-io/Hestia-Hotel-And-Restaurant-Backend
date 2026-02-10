const Hotel = require('../model/Hotel.js');
const bcrypt = require('bcryptjs');
const { sendHotelOTPEmail, sendHotelWelcomeEmail } = require('../common/emailSender.js');
const { uploadHotelImage } = require('../common/multerConfig');

const registerHotel = async (req, res) => {
    try {
        const { name, email, password, phone, address, city, state, country } = req.body;
        let profile_picture = null;
        
        if (req.file) {
            const uploadResult = await uploadHotelImage(req.file);
            profile_picture = uploadResult.url;
            
            // Log compression info
            console.log(`Image compressed: ${uploadResult.originalSize} bytes -> ${uploadResult.compressedSize} bytes (${uploadResult.compressionRatio}% reduction)`);
        }
        
        const existingHotel = await Hotel.findOne({ email });
        if (existingHotel) {
            return res.status(400).json({ message: 'Hotel already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const hotel = new Hotel({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            city,
            state,
            country,
            profile_picture,
            status: 'pending',
            isOtpVerified: false,
            otp,
            otpExpiry
        });
        
        await hotel.save();

        // Send OTP email
        const emailSent = await sendHotelOTPEmail(email, name, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Hotel registered but failed to send OTP email' });
        }

        res.status(201).json({ 
            message:'Hotel registered successfully. Please verify your email with the OTP sent to your email address.',
            email: email
        });
    } catch (error) {
        console.error('Error registering hotel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyHotelOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const hotel = await Hotel.findOne({ email });
        if (!hotel) {
            return res.status(400).json({ message: 'Hotel not found' });
        }

        if (!hotel.otp || hotel.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > hotel.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        hotel.isOtpVerified = true;
        hotel.otp = undefined;
        hotel.otpExpiry = undefined;
        await hotel.save();

        // Send welcome email
        await sendHotelWelcomeEmail(email, hotel.name);

        res.status(200).json({ 
            message: 'Email verified successfully. Your hotel registration is now pending admin approval.' 
        });
    } catch (error) {
        console.error('Error verifying hotel OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resendHotelOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const hotel = await Hotel.findOne({ email });
        if (!hotel) {
            return res.status(400).json({ message: 'Hotel not found' });
        }

        if (hotel.isOtpVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        hotel.otp = otp;
        hotel.otpExpiry = otpExpiry;
        await hotel.save();

        const emailSent = await sendHotelOTPEmail(email, hotel.name, otp);
        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        res.status(200).json({ message: 'New OTP sent to your email' });
    } catch (error) {
        console.error('Error resending hotel OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    registerHotel,
    verifyHotelOTP,
    resendHotelOTP
};