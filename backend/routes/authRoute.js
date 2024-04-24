const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.handleLogin);

router.get('/getUserName', authController.getUserName);

module.exports = router;