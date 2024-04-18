const Conversation = require("../model/conversation");

const fetchConversation = async (req, res) => {
  try {
    const convID = req.query.convID;
    if (!convID) {
      return res.status(400).json({ message: 'Conversation ID is required' });
    }
    const conversation = await Conversation.findOne({ convID });
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


const newConversation = async(req, res) => {
  try {
    const { convID, pdfName, qaSequence } = req.body;

    if(!convID || !pdfName || !qaSequence) {
      return res.status(400);
    }
    const existingConversation = await Conversation.findOne({ convID });
    if (existingConversation) {
      return res.status(409).json({ message: 'A conversation with this ID already exists' });
    }

    const newConversation = new Conversation ({ convID, pdfName, qaSequence});
    await newConversation.save();
    res.status(201).json(newConversation);
  } catch (err) {
    console.error(err);
  }
}

const addQA = async(req, res) => {
  try {
    const { convID } = req.params;
    const { question, answer } = req.body;
  
    if (!convID || !question || !answer) {
      return res.status(400).json({ message: 'Missing required fields.'});
    }
    const conversation = await Conversation.findOne({ convID });
    
    if(!conversation) {
      return res.status(404).json({ message: 'Conversation not found.'});
    }
    conversation.qaSequence.push({ question, answer });

    await conversation.save();
    res.status(200).json(conversation);
  } catch (err) {
    console.error(err);
  }
}

module.exports = { fetchConversation, newConversation, addQA }