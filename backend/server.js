require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')
const cors = require('cors');
const bodyParser = require('body-parser');

//const {vectorizePDF, createConvo, convo} = require('./openAIInterface');
const readline = require('readline');


connectDB();

app.use(express.json());

app.use("/api", require("./routes/conversationRoute"));
app.use("/api", require("/routes/utilRoutes"))

const pdfName = "murder_mystery_show";
const pdfPath = "PDFs/" + pdfName;
// defailt id for testing
let id = '661d377d39214f37e74b6a26';

// API endpoint for recieving user input
app.post("/userInput", async (req,res) => {
  const {input} = req.body;

  const AIresponse = await convo.askQuestion(id, pdfPath, `${input}`);

  res.json({
    message: AIresponse
  });
});

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

// sample conversation in the terminal:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('line', async (input) => {

  // vectorize pdf file
  if (input == 'vector') {
    vectorizePDF(pdfPath);
  }

  // create new conversation in the database and use its id
  else if (input == 'new') {
    id = await createConvo(pdfName);
    console.log(id);
  }

  // update local chat history
  else if (input == 'update') {
    await convo.updateHistory(id);
  }

  // chat with the conversation cooresponding to previous id
  else {
    console.log("AI response:");
    const AImessage = await convo.askQuestion(id, pdfPath, input);
    console.log(AImessage);
  }
  console.log("---------------------------------");
  
});
