require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')



const {vectorizePDF, createConvo, convo} = require('./openAIInterface');
const readline = require('readline');


connectDB();

app.use(express.json());

app.use("/api", require("./routes/conversationRoute"))

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

//const chatHistory = mongoose.connection.collection('chat-history');




const pdfName = "murder_mystery_show";
const pdfPath = "PDFs/" + pdfName;
//vectorizePDF(pdfPath);


// defailt id for testing
let id = '6610081b9f04d21c94c08a47';



// sample conversation in the terminal:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('line', async (input) => {

  // create new conversation in the database and use its id
  if (input == 'new') {
    id = await createConvo();
    console.log(id);
  }

  // update local chat history
  else if (input == 'update') {
    await convo.updateHistory(id);
  }

  // chat with the conversation cooresponding to previous id
  else {
    console.log("AI response:");
    await convo.askQuestion(id, pdfPath, input);
  }
  console.log("---------------------------------");
  
});
