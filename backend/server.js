require("dotenv").config();

const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')

const {convo, clearHistory, printHistory} = require('./conversation');
const {askQuestion, uploadPdf} = require('./AskQuestion');


connectDB();

app.use(express.json());

//add routes maybe cors

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

const chatHistory = mongoose.connection.collection('chat-history');



const user_input = "who is killed in \“DEATH AND OTHER DETAILS\"?";
pdfname = "murder_mystery_show";

async function run() {
  await uploadPdf(pdfname);
  askQuestion(user_input, pdfname);
}

run()

//const sessionID = "65f46bbf9b67688f308da0e8";

// clearHistory(chatHistory, sessionID);
// printHistory(chatHistory, sessionID);