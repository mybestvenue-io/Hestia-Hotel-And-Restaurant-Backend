const express = require('express');
const { upload } = require('../common/multerConfig');
const { testBulkImageUpload, testSingleImageUpload } = require('../controller/testImageController');

const router = express.Router();

// Test single image upload with automatic WebP conversion and compression
router.post('/test-single-image', upload.single('image'), testSingleImageUpload);

// Test bulk image upload with automatic WebP conversion and compression
router.post('/test-bulk-images', upload.array('images', 10), testBulkImageUpload);

module.exports = router;