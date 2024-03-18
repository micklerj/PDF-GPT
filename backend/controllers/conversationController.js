const Conversation = require("../model/tweet");

const fetchConversation = async(req, res) => {
  try {
    const conversations = await Conversation.find({});
    res.status((200)).json(conversations);
  } catch (err) {
    console.error(err);
  }
}

const newConversation = async(req, res) => {
  try {
    const { convID, qaSequence } = req.body;

    if(!convID || !qaSequence) {
      return res.status(400);
    }
    const newConversation = new Conversation ({ convID, qaSequence});
    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { fetchConversation, newConversation }