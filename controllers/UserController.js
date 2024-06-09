const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// helpers
const createUserToken = require("../helpers/create-user-token");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class UserController {
    static async register(req, res) {
        const { name, email, phone, password, confirmpassword } = req.body;

        // validations
        if (!name) {
            return res.status(422).json({ message: "name is required" });
        }
        if (!email) {
            return res.status(422).json({ message: "email is required" });
        }
        if (!phone) {
            return res.status(422).json({ message: "phone is required" });
        }
        if (!password) {
            return res.status(422).json({ message: "password is required" });
        }

        if (password.length < 6) {
            return res
                .status(422)
                .json({ message: "the password is too short" });
        }

        if (!confirmpassword) {
            return res
                .status(422)
                .json({ message: "confirmpassword is required" });
        }
        if (password !== confirmpassword) {
            return res.status(422).json({ message: "passwords don't match" });
        }

        // check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res
                .status(422)
                .json({ message: "this email is already in use" });
        }

        //password encryption
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // create user
        const user = new User({ name, email, phone, password: passwordHash });

        try {
            const newUser = await user.save();
            await createUserToken(newUser, req, res);
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;

        if (!email) {
            res.status(422).json({ message: "email is required" });
            return;
        }

        if (!password) {
            res.status(422).json({ message: "password is required" });
            return;
        }

        const user = await User.findOne({ email });

        // check if the user exists in database
        if (!user) {
            res.status(422).json({ message: "user not found in database" });
            return;
        }

        if (!(await bcrypt.compare(password, user.password))) {
            res.status(422).json({ message: "wrong password" });
            return;
        }

        await createUserToken(user, req, res);
    }

    static async checkUser(req, res) {
        let currentUser;

        if (req.headers.authorization) {
            const token = jwt.verify(getToken(req), "nossoSecret");

            currentUser = await User.findById(token.id);
            currentUser.password = undefined;
        } else {
            currentUser = null;
        }

        res.status(200).json(currentUser);
    }

    static async getUserById(req, res) {
        const id = req.params.id;
        let user;

        try {
            user = await User.findById(id).select("-password");
        } catch (error) {
            res.status(422).json({ message: "invalid id" });
            return;
        }

        // check if the user exists in database
        if (!user) {
            res.status(422).json({ message: "user not found in database" });
            return;
        }

        res.status(200).json({ user });
    }

    static async editUser(req, res) {
        const user = await getUserByToken(getToken(req));

        const { name, email, phone, password, confirmpassword } = req.body;

        if (req.file) {
            user.image = req.file.filename;
        }

        // validations
        if (!name) {
            return res.status(422).json({ message: "name is required" });
        }

        user.name = name;

        if (!email) {
            return res.status(422).json({ message: "email is required" });
        }

        // check if the given new email is valid
        if (email != user.email && (await User.findOne({ email }))) {
            res.status(422).json({ message: "this email is already in use" });
            return;
        }

        user.email = email;

        if (!phone) {
            return res.status(422).json({ message: "phone is required" });
        }

        user.phone = phone;

        if (password !== undefined) {
            if (password.length < 6) {
                return res
                    .status(422)
                    .json({ message: "the password is too short" });
            }
        }

        if (password != confirmpassword) {
            return res.status(422).json({ message: "passwords don't match" });
        }

        // change password
        else if (password === confirmpassword && password != null) {
            // creating password
            const salt = await bcrypt.genSalt(12);
            const passwordHash = await bcrypt.hash(password, salt);

            user.password = passwordHash;
        }

        try {
            await User.findOneAndUpdate(
                { _id: user.id },
                { $set: user },
                { new: true }
            );

            res.sendStatus(200);
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }
};
