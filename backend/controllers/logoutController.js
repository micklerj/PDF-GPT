const users = require('../model/userlogin');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

const handleLogout = async (req, res) => {
    // On client frontend, also delete access token


    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.sendStatus(204);
    }
    const refreshToken = cookies.jwt;

    // Is refreshtoken in db?
    const user = await users.findOne({ refreshToken }).exec();
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, maxAge: 86400000 });
        return res.sendStatus(403);
    }

    // Delete refreshToken in db
    user.refreshToken = '';
    const result = await user.save();
    console.log(result);

    res.clearCookie('jwt', { httpOnly: true, maxAge: 86400000 });
    res.sendStatus(204);
}

module.exports = { handleRefreshToken }