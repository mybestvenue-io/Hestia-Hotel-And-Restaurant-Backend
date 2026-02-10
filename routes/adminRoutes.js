const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { upload } = require('../common/multerConfig');

router.get('/health', (req, res) => res.json({ service: 'admin', status: 'ok' }));
router.post('/register', upload.single('profile_picture'), adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/forgot-password', adminController.forgotPassword);
router.post('/verify-otp', adminController.verifyOTP);
router.post('/resend-otp', adminController.resendOTP);
router.post('/update-password', adminController.updatePassword);
router.post('/reset-password', adminController.resetPassword);
router.get('/profile/:adminId', adminController.getAdminProfile);
router.put('/edit-profile/:adminId', upload.single('profile_picture'),adminController.editAdminProfile);


// Hotel management routes
router.get('/hotels/pending', adminController.getPendingHotels); 
router.put('/hotels/:hotelId/approve', adminController.approveHotel);
router.put('/hotels/:hotelId/reject', adminController.rejectHotel);

module.exports = router;

