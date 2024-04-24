const express = require('express');
const router = express.Router();
const addConvController = require('../controllers/addConvController');

router.put('/addConv/:username', addConvController.addConv);

router.get('/getUser', addConvController.fetchUser);

module.exports = router;