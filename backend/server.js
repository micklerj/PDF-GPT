require("dotenv").config();

const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')

const {vectorizePDF, convo, convo2, clearHistory, printHistory} = require('./conversation');


connectDB();

app.use(express.json());

//add routes maybe cors

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

const chatHistory = mongoose.connection.collection('chat-history');



const user_input = "who is killed in \“DEATH AND OTHER DETAILS\"? whats my name";
pdfname = "murder_mystery_show";

const sessionID = "65f46cc9c537afc17dbef3d0";

//vectorizePDF(pdfname);

//convo(chatHistory, sessionID, user_input);

convo2(pdfname, user_input);


// clearHistory(chatHistory, sessionID);
// printHistory(chatHistory, sessionID);