const { upload } = require('../common/multerConfig');
const { uploadMultipleImages } = require('../common/bulkImageUpload');

// Test endpoint for bulk image upload
const testBulkImageUpload = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images provided' });
        }

        const result = await uploadMultipleImages(req.files, 'test-uploads');
        
        res.status(200).json({
            message: 'Images uploaded successfully',
            ...result
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ message: 'Failed to upload images' });
    }
};

// Test endpoint for single image upload
const testSingleImageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const { uploadProcessedImage } = require('../common/imageProcessor');
        const result = await uploadProcessedImage(req.file.buffer, req.file.originalname, 'test-uploads');
        
        res.status(200).json({
            message: 'Image uploaded successfully',
            url: result.url,
            fileId: result.fileId,
            name: result.name,
            originalSize: result.originalSize,
            compressedSize: result.compressedSize,
            compressionRatio: result.compressionRatio,
            sizeSaved: `${((result.originalSize - result.compressedSize) / 1024).toFixed(2)} KB`
        });
    } catch (error) {
        console.error('Single upload error:', error);
        res.status(500).json({ message: 'Failed to upload image' });
    }
};

module.exports = {
    testBulkImageUpload,
    testSingleImageUpload
};