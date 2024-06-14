const Pet = require("../models/Pet");

// helpers
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
    // create a pet
    static async create(req, res) {
        const { name, age, specie, gender, weight, color } = req.body;
        const images = req.files;
        const available = true;

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

        // images upload
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
    }

    static async getAll(req, res) {
        const pets = await Pet.find().sort("-createdAt");
        res.status(200).json({ pets });
    }

    static async getAllUserPets(req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await Pet.find({ "user._id": user._id }).sort(
            "-createdAt"
        );

        res.status(200).json({ pets });
    }

    static async getAllUserAdoptions(req, res) {
        const token = getToken(req);
        const user = await getUserByToken(token);

        const pets = await Pet.find({ "adopter._id": user._id }).sort(
            "-createdAt"
        );

        res.status(200).json({ pets });
    }

    static async getPetById(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "invalid ID" });
        }

        // check if pet exists in the database
        const pet = await Pet.findOne({ _id: id });

        if (!pet) {
            res.status(404).json({ message: "pet not found in database" });
            return;
        }

        res.status(200).json({ pet });
    }

    static async removePetById(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "invalid ID" });
        }

        // check if pet exists in the database
        const pet = await Pet.findOne({ _id: id });

        if (!pet) {
            res.status(404).json({ message: "pet not found in database" });
            return;
        }

        // check if pet belongs to the logged user
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: "bad request" });
        }

        await Pet.findByIdAndDelete(pet._id);

        res.status(200).json({
            message: `pet ${pet.name} successfully removed`,
        });
    }

    static async updatePet(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "invalid ID" });
        }

        const { name, age, specie, gender, weight, color, available } =
            req.body;

        const images = req.files;
        const updatedData = {};

        // check if pet exists in the database
        const pet = await Pet.findOne({ _id: id });

        if (!pet) {
            res.status(404).json({ message: "pet not found in database" });
            return;
        }

        // check if pet belongs to the logged user
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: "bad request" });
        }

        // validations
        if (!name) {
            return res.status(422).json({ message: "name is required" });
        } else {
            updatedData.name = name;
        }

        if (!age) {
            return res.status(422).json({ message: "age is required" });
        } else {
            updatedData.age = age;
        }

        if (!specie) {
            return res.status(422).json({ message: "specie is required" });
        } else {
            updatedData.specie = specie;
        }

        if (!gender) {
            return res.status(422).json({ message: "gender is required" });
        } else {
            updatedData.gender = gender;
        }

        if (!weight) {
            return res.status(422).json({ message: "weight is required" });
        } else {
            updatedData.weight = weight;
        }

        if (!color) {
            return res.status(422).json({ message: "color is required" });
        } else {
            updatedData.color = color;
        }

        if (images.length < 1) {
            return res.status(422).json({ message: "image is required" });
        } else {
            updatedData.images = [];
            images.map((image) => {
                updatedData.images.push(image.filename);
            });
        }

        if (!available) {
            res.status(422).json({ message: "available status is required" });
            return;
        } else {
            updatedData.available = available;
        }

        try {
            await Pet.findByIdAndUpdate(id, updatedData);
            return res.status(200).json({
                message: `pet ${pet.name} successfully updated`,
            });
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }

    static async scheduleAdoption(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "invalid ID" });
        }

        // check if pet exists in the database
        const pet = await Pet.findOne({ _id: id });

        if (!pet) {
            res.status(404).json({ message: "pet not found in database" });
            return;
        }

        if (!pet.available) {
            return res
                .status(422)
                .json({ message: "pet is not available for adoption" });
        }

        // prevents the user from scheduling a visit with a pet he owns
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.equals(user._id)) {
            return res.status(400).json({
                message:
                    "you cannot schedule a visit with a pet that belongs to you",
            });
        }

        // prevents the user from scheduling a visit if he has already done so
        if (pet.adopter) {
            if (pet.adopter._id.equals(user._id)) {
                return res.status(400).json({
                    message: "you have already scheduled a visit with this pet",
                });
            }
        }

        // add user as adopter
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image,
        };

        try {
            await Pet.findByIdAndUpdate(id, pet);
            return res.status(200).json({
                message: `Visit successfuly scheduled. Contact ${pet.user.name} on the number ${pet.user.phone}`,
            });
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }

    static async completeAdoption(req, res) {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(422).json({ message: "invalid ID" });
        }

        // check if pet exists in the database
        const pet = await Pet.findOne({ _id: id });

        if (!pet) {
            res.status(404).json({ message: "pet not found in database" });
            return;
        }

        if (!pet.available) {
            return res
                .status(422)
                .json({ message: "pet is not available for adoption" });
        }

        // check if pet belongs to the logged user
        const token = getToken(req);
        const user = await getUserByToken(token);

        if (pet.user._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: "bad request" });
        }

        pet.available = false;

        try {
            await Pet.findByIdAndUpdate(id, pet);
            return res.status(200).json({
                message: `${pet.name} was successfuly adopted by ${user.name}`,
            });
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }
};
