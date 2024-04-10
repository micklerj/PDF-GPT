const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/middleware');

// Protected Route

router.get('/', verifyToken, (req, res) => {
    res.status(200).json({ message: 'Welcome to the protected route' });
});

module.exports = router;
