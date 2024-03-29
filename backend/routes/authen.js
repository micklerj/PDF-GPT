const express = require('express');
const router = express.Router();
const User = require('../models/userlogin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Registering a user
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            password: hashword
        });
        await user.save();
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});


//Loging in a user

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'Authentication failed' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(404).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ username: user.username }, 'secretkey', {
            expiresIn: '12h'
        });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Login failed' });
    }
});

module.exports = router;