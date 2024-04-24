const users = require('../model/userlogin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleNewUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required.' });
    }
    const duplicate = await users.findOne({ username: username }).exec();
    if (duplicate) {
        return res.sendStatus(409);
    }
    try {
        const hashword = await bcrypt.hash(password, 10);
        const result = await users.create({
            "username": username,
            "password": hashword
        });

        console.log(result);
        res.status(201).json({ message: 'Registration successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { handleNewUser }
