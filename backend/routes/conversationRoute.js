const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

router.get('/getConversation', conversationController.fetchConversation);

router.post('/createConversation', conversationController.newConversation);

router.put('/addQA/:convID', conversationController.addQA);

module.exports = router;