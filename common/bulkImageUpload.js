const { uploadProcessedImage } = require('./imageProcessor');

/**
 * Process and upload multiple images
 * @param {Array} files - Array of multer file objects
 * @param {string} folder - ImageKit folder
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultipleImages = async (files, folder = 'uploads') => {
    try {
        const uploadPromises = files.map(file => 
            uploadProcessedImage(file.buffer, file.originalname, folder)
        );
        
        const results = await Promise.all(uploadPromises);
        
        return {
            success: true,
            count: results.length,
            images: results.map(result => ({
                url: result.url,
                fileId: result.fileId,
                name: result.name,
                originalSize: result.originalSize,
                compressedSize: result.compressedSize,
                compressionRatio: result.compressionRatio
            })),
            totalOriginalSize: results.reduce((sum, r) => sum + r.originalSize, 0),
            totalCompressedSize: results.reduce((sum, r) => sum + r.compressedSize, 0)
        };
    } catch (error) {
        console.error('Bulk upload error:', error);
        throw error;
    }
};

module.exports = {
    uploadMultipleImages
};