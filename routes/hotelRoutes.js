const express = require('express');
const router = express.Router();
const { upload } = require('../common/multerConfig');
const { registerHotel, verifyHotelOTP, resendHotelOTP } = require('../controller/hotelController');

router.get('/health', (req, res) => res.json({ service: 'hotel', status: 'ok' }));
router.post('/register', upload.single('profile_picture'), registerHotel);
router.post('/verify-otp', verifyHotelOTP);
router.post('/resend-otp', resendHotelOTP);

module.exports = router;