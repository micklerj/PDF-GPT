const fs = require('fs');
const axios = require('axios');
const { getPDFNameFromPath } = require('./util'); 
const createConvo = async (pdfPath) => {
  try {
    const pdfName = getPDFNameFromPath(`./${pdfPath}.index`);
    const response = await axios.get('http://localhost:3500/api/generate-session-id');
    const id = response.data.sessionID;

    const postData = {
      convID: id,
      pdfName: pdfName,
      qaSequence: []
    };

    await axios.post('http://localhost:3500/api/newConversation', postData);
    return id; // Return the conversation ID
  } catch (error) {
    console.error('Error:', error);
    return null; 
  }
}

const addQuestion = async (pdfPath, user_input) => {
  const convID = await createConvo(pdfPath); 
  if (!convID) {
    console.error('Failed to create conversation');
    return;
  }

  const addQuestionData = {
    convID: convID,
    question: user_input,
    answer: '' 
  };

  try {
    await axios.put(`http://localhost:3500/api/addQA/${convID}`, addQuestionData);
  } catch (error) {
    console.error('Error posting question:', error);
  }
}

// Example usage
addQuestion('path/to/pdfFile', 'What is the main topic of the document?');
