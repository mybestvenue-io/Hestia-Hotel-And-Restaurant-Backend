const ImageKit = require('imagekit');

let imagekit;

if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/tqbrtvygh',
    });
} else {
    console.warn('⚠️ IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY not set in .env.');
    console.warn('📸 ImageKit upload will use mock/fallback URLs in development until keys are provided.');
    imagekit = {
        upload: async ({ fileName }) => {
            return {
                url: `https://ik.imagekit.io/tqbrtvygh/${encodeURIComponent(fileName)}`,
                fileId: 'mock_' + Date.now(),
            };
        },
    };
}

module.exports = imagekit;