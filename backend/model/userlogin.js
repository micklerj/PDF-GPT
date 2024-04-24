const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true 
    },
    convos: [{
        convID: {
            type: String,
            required: true
        },
        pdfName: {
            type: String,
            required: true
        }
    }], 
    password: { 
        type: String, 
        required: true 
    },
});
module.exports = mongoose.model('User', Schema);