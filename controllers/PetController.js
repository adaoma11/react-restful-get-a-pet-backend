const Pet = require("../models/Pet");

// helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");

module.exports = class PetController {
    // create a pet
    static async create(req, res) {
        const { name, age, specie, gender, weight, color } = req.body;
        const images = req.files;

        const available = true;

        // images upload

        // validations
        if (!name) {
            return res.status(422).json({ message: "name is required" });
        }
        if (!age) {
            return res.status(422).json({ message: "age is required" });
        }
        if (!specie) {
            return res.status(422).json({ message: "specie is required" });
        }
        if (!gender) {
            return res.status(422).json({ message: "gender is required" });
        }
        if (!weight) {
            return res.status(422).json({ message: "weight is required" });
        }
        if (!color) {
            return res.status(422).json({ message: "color is required" });
        }
        if (images.length < 1) {
            return res.status(422).json({ message: "image is required" });
        }

        // get pet owner
        const token = getToken(req);
        const user = await getUserByToken(token);

        // create a pet
        const pet = new Pet({
            name,
            age,
            specie,
            gender,
            weight,
            color,
            available,
            images: [],
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                phone: user.phone,
            },
        });

        images.map((image) => {
            pet.images.push(image.filename);
        });

        try {
            const newPet = await pet.save();
            return res.status(201).json({
                message: `pet ${pet.name} successfully created`,
                newPet,
            });
        } catch (err) {
            return res.status(500).json({ message: err });
        }

        res.status(200).json({ message: "ok" });
    }
};
