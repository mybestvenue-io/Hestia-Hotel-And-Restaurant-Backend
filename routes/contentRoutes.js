
const express = require('express');
const router = express.Router();
const { upload } = require('../common/multerConfig');
const { addOrUpdateContent, getContentByUrl, updateContentByUrl } = require('../controller/contentController');


// router.get('/health', (req, res) => res.json({ service: 'url-content', status: 'ok' }));
router.post('/addUrl-content', addOrUpdateContent);

// This route is for the public-facing pages to fetch content by its URL path
router.get('/url/:url_path', getContentByUrl);

// This route is for the admin to update content by its URL path
router.put('/update-content/:url_path', updateContentByUrl);

module.exports = router;