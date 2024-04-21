const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/aiController');

router.post('/vectorize', aiController.vectorizePDF);

router.post('/newChat', aiController.createConvo);

router.put('/initOldChat', aiController.convo.updateHistory);

router.post('/userInput', aiController.convo.askQuestion);

module.exports = router;