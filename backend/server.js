require("dotenv").config;
const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')

//for login authentication
const authenticate = require('./routes/authen');
const protectedRoute = require('./routes/proroute');

connectDB();

app.use(express.json());

app.use('/auth', authenticate);
app.use('/protected', protectedRoute);

//add routes maybe cors

mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(port, () => console.log(`Server running on port ${port}`));
})
