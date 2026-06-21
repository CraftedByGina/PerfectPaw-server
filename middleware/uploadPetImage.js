const multer = require("multer");

const imageStorage = multer.memoryStorage();
const maxPetImageSizeMb = 15;
const maxPetImageSizeBytes = maxPetImageSizeMb * 1024 * 1024;

const petImageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: maxPetImageSizeBytes,
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

    if (error.code === "LIMIT_FILE_SIZE") {
      error.message = `Uploaded pet photo must be smaller than ${maxPetImageSizeMb} MB.`;
    }

    error.statusCode = 400;
    next(error);
  });
};

module.exports = uploadPetImage;
