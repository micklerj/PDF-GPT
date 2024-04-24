const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    convos: { type: [String], default: [] }, // Array of conversation IDs, implement later
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', Schema);