const router = require("express").Router();
const PetController = require("../controllers/PetController");

// middlewares
const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

router.post(
    "/create",
    imageUpload.array("images"),
    verifyToken,
    PetController.create
);

router.get("/", PetController.getAll);

module.exports = router;
