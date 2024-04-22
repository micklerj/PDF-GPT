const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/refreshTokenController');

router.post('/refresh', refreshTokenController.handleRefreshToken);

module.exports = router;