const express = require('express');
const router = express.Router();
const { upload } = require('../common/multerConfig');
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  uploadRoomMedia,
} = require('../controller/roomController');

router.get('/', getRooms);
router.get('/:id', getRoomById);

router.post('/', upload.single('image'), createRoom);
router.post('/upload-image', upload.single('image'), uploadRoomMedia);
router.put('/:id', upload.single('image'), updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
