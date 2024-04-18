const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  convID: {
    type: String,
    required: true
  },
  pdfName: {
    type: String,
    required: true
  },
  qaSequence: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  }]
});


module.exports = mongoose.model('conversation', conversationSchema);