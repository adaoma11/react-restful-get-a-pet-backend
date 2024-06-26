const jwt = require("jsonwebtoken");

const createUserToken = async (user, req, res) => {
    // create token
    const token = jwt.sign(
        {
            name: user.name,
            id: user._id,
        },
        "nossoSecret"
    );

    // return token
    res.status(200).json({
        message: `${user.name} successfully authenticated`,
        token: token,
        userId: user._id,
    });
};

module.exports = createUserToken;
