require("dotenv").config();

const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')

const {vectorizePDF, convo} = require('./openAIInterface');
const readline = require('readline');


connectDB();

app.use(express.json());

//add routes maybe cors

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

const chatHistory = mongoose.connection.collection('chat-history');




const pdfname = "PDFs/" + "murder_mystery_show";


//vectorizePDF(pdfname);

// sample conversation in the terminal:
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.on('line', async (input) => {
  await convo.askQuestion(pdfname, input);
  console.log("------------------------");
});
