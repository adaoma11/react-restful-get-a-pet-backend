const jwt = require("jsonwebtoken");
const User = require("../models/User");

// get user by jwt token
const getUserByToken = async (token) => {
    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const verified = jwt.verify(token, "nossoSecret");
        return await User.findOne({ _id: verified.id });
    } catch (err) {
        return res.status(400).json({ message: "invalid token" });
    }
};

module.exports = getUserByToken;
