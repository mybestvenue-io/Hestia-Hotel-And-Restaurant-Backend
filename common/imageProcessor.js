const sharp = require('sharp');
const imagekit = require('./imagekitConfig');

/**
 * Process and compress image to WebP format under 100KB
 * @param {Buffer} buffer - Image buffer
 * @param {string} originalName - Original filename
 * @returns {Promise<Buffer>} - Processed image buffer
 */
const processImage = async (buffer, originalName) => {
    try {
        let quality = 80;
        let processedBuffer;
        
        // Convert to WebP and compress
        do {
            processedBuffer = await sharp(buffer)
                .webp({ quality })
                .toBuffer();
            
            // If still too large, reduce quality
            if (processedBuffer.length > 100 * 1024 && quality > 10) {
                quality -= 10;
            } else {
                break;
            }
        } while (processedBuffer.length > 100 * 1024 && quality > 10);
        
        return processedBuffer;
    } catch (error) {
        console.error('Image processing error:', error);
        throw new Error('Failed to process image');
    }
};

/**
 * Upload processed image to ImageKit
 * @param {Buffer} buffer - Original image buffer
 * @param {string} originalName - Original filename
 * @param {string} folder - ImageKit folder
 * @returns {Promise<Object>} - ImageKit upload result
 */
const uploadProcessedImage = async (buffer, originalName, folder = 'uploads') => {
    try {
        // Process image to WebP under 100KB
        const processedBuffer = await processImage(buffer, originalName);
        
        // Generate WebP filename
        const nameWithoutExt = originalName.split('.')[0];
        const webpFileName = `${Date.now()}-${nameWithoutExt}.webp`;
        
        // Upload to ImageKit
        const result = await imagekit.upload({
            file: processedBuffer,
            fileName: webpFileName,
            folder: folder,
            useUniqueFileName: false
        });
        
        return {
            ...result,
            originalSize: buffer.length,
            compressedSize: processedBuffer.length,
            compressionRatio: ((buffer.length - processedBuffer.length) / buffer.length * 100).toFixed(2)
        };
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw error;
    }
};

module.exports = {
    processImage,
    uploadProcessedImage
};