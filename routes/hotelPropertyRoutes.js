const express = require('express');
const router = express.Router();
const { upload } = require('../common/multerConfig');
const {
  getHotels,
  getHotelBySlug,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  uploadHotelMedia,
} = require('../controller/hotelPropertyController');

router.get('/', getHotels);
router.get('/slug/:slug', getHotelBySlug);
router.get('/:id', getHotelById);

router.post('/', upload.single('image'), createHotel);
router.post('/upload-image', upload.single('image'), uploadHotelMedia);
router.put('/:id', upload.single('image'), updateHotel);
router.delete('/:id', deleteHotel);

module.exports = router;
