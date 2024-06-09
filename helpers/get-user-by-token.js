const jwt = require("jsonwebtoken");
const User = require("../models/User");

// get user by jwt token
const getUserByToken = async (token) => {
    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }
    const decoded = jwt.verify(token, "nossoSecret");
    return await User.findOne({ _id: decoded.id });
};

module.exports = getUserByToken;
