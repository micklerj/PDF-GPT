const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

router.get('/getConversation', conversationController.fetchConversation);

router.post('/createConversation', conversationController.newConversation);

module.exports = router;