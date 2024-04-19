const express = require('express');
const router = express.Router();
const { genSessionID } = require('./utils'); 

router.get('/generate-session-id', (req, res) => {
  const sessionID = genSessionID();
  res.json({ sessionID });
});

module.exports = router;