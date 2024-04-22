require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')
const cors = require('cors');


const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/dbConfig');

// Connect to MongoDB
connectDB();
app.use(cors());
app.use("/api", require("./routes/fileRoutes"));

// Middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

//routes for conversation
app.use("/api", require("./routes/conversationRoute"))

//routes for register, login, refersh, and logout
app.use('/register', require('./routes/registerRoute'));
app.use('/auth', require('./routes/authRoute'));
app.use('/refresh', require('./routes/refreshRoute'));
app.use('/logout', require('./routes/logoutRoute'));
app.use(verifyJWT);


mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
