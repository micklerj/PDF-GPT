const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/conversationController');

router.get('/', conversationController.fetchConversation);

router.post('/', conversationController.newConversation);

module.exports = router;