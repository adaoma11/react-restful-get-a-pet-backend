const multer = require("multer");
const path = require("path");

// Destination to store images
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `public/images${req.baseUrl}`);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter(req, file, cb) {
        file.originalname.match(/\.(png|jpg|PNG|JPG)$/)
            ? cb(undefined, true)
            : cb(new Error("only jpg or png are allowed"));
    },
});

module.exports = { imageUpload };
