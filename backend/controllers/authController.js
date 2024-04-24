const users = require('../model/userlogin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required.' });
    }
    const user = await users.findOne({ username: username }).exec();
    if (!user) {
        return res.sendStatus(401);
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
        const convos = []; // Implement later
        const accessToken = jwt.sign({ username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' });
        const refreshToken = jwt.sign({ username: user.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        user.refreshToken = refreshToken;
        const result = await user.save();
        console.log(result);

        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 86400000 });
        res.json({ convos, accessToken }); // Array of conversation objects, implement later
    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin }