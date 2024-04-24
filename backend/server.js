require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.port || 3500; //backend will run on local port 3500
const mongoose = require('mongoose');
const connectDB = require('./config/dbConfig')
const cors = require('cors');


const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');

// Connect to MongoDB
connectDB();
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,  
};
app.use(cors(corsOptions));
app.use("/api", require("./routes/fileRoutes"));

// Middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

//routes for conversation
app.use("/api", require("./routes/conversationRoute"));
app.use("/api", require("./routes/aiRoutes"))

//routes for register, login, refersh, and logout   and adding convID to user's convID list
app.use('/api', require('./routes/registerRoute'));

app.use('/api', require('./routes/authRoute'));
app.use('/api', require('./routes/refreshRoute'));
app.use('/api', require('./routes/logoutRoute'));
app.use('/api', require('./routes/addConvRoute'));


mongoose.connection.once('open', () => {
  console.log("connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
