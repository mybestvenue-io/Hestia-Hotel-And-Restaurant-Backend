const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => res.json({ service: 'user', status: 'ok' }));

module.exports = router;

