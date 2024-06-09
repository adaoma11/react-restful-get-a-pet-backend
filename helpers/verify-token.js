const jwt = require("jsonwebtoken");
const getToken = require("./get-token");

// middleware to validate token
const checkToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "unauthorized" });
    }

    const token = getToken(req);

    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }

    try {
        const verified = jwt.verify(token, "nossoSecret");
        req.user = verified;
        return next();
    } catch (err) {
        return res.status(400).json({ message: "invalid token" });
    }
};

module.exports = checkToken;
