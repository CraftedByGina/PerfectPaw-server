const multer = require("multer");

const imageStorage = multer.memoryStorage();

const petImageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new Error("Pet image must be an image file"));
  },
}).single("image");

const uploadPetImage = (req, res, next) => {
  petImageUpload(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    error.statusCode = 400;
    next(error);
  });
};

module.exports = uploadPetImage;
