const express = require('express');
const router = express.Router();
const refreshTokenController = require('../controllers/logoutController');

router.post('/logout', logoutController.handleLogout);

module.exports = router;