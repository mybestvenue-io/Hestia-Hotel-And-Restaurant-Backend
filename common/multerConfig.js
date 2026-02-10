const multer = require('multer');
const path = require('path');
const imagekit = require('./imagekitConfig');

// Memory storage for ImageKit upload
const storage = multer.memoryStorage();

// File filter - accept common image formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = /webp|avif|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /^image\/(webp|avif|jpeg|jpg|png)$/.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only WebP, AVIF, JPEG, JPG, and PNG image formats are allowed'));
};

const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB file limit
        fieldSize: 10 * 1024 * 1024, // 10MB field size limit (for rich blog content)
        fields: 20, // Maximum number of non-file fields
        parts: 30 // Maximum number of parts (fields + files)
    },
    fileFilter: fileFilter
});

// Direct ImageKit upload without conversion
const uploadToImageKit = async (file, folder = 'uploads') => {
    try {
        const fileName = `${Date.now()}-${file.originalname}`;
        
        const result = await imagekit.upload({
            file: file.buffer,
            fileName: fileName,
            folder: folder,
            useUniqueFileName: false
        });
        
        return result;
    } catch (error) {
        console.error('ImageKit upload error:', error);
        throw error;
    }
};

// Upload functions for different content types
const uploadProfileImage = (file) => uploadToImageKit(file, 'profiles');
const uploadBlogImage = (file) => uploadToImageKit(file, 'blogs');
const uploadHotelImage = (file) => uploadToImageKit(file, 'hotels');

module.exports = { upload, uploadToImageKit, uploadProfileImage, uploadBlogImage, uploadHotelImage };