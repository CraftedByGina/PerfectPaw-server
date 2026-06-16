const mongoose = require("mongoose");
const { v2: cloudinary } = require("cloudinary");
const Pet = require("../models/pet.model");
const Shelter = require("../models/shelter.model");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );

const configureCloudinary = () => {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(true);
    cloudinary.config({ secure: true });
    return;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const getCardImageUrl = (uploadResult) =>
  cloudinary.url(uploadResult.public_id, {
    secure: true,
    width: 900,
    height: 650,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    fetch_format: "auto",
  });

const uploadPetImageToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      const error = new Error("Cloudinary is not configured for pet image uploads");
      error.statusCode = 500;
      reject(error);
      return;
    }

    configureCloudinary();

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "perfectpaw/pets",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(getCardImageUrl(result));
      }
    );

    stream.end(file.buffer);
  });

const parseTraits = (traits) => {
  if (Array.isArray(traits)) {
    return traits.map((trait) => String(trait).trim()).filter(Boolean);
  }

  if (typeof traits !== "string") {
    return traits;
  }

  try {
    const parsedTraits = JSON.parse(traits);

    if (Array.isArray(parsedTraits)) {
      return parsedTraits.map((trait) => String(trait).trim()).filter(Boolean);
    }
  } catch {
    return traits
      .split(",")
      .map((trait) => trait.trim())
      .filter(Boolean);
  }

  return traits
    .split(",")
    .map((trait) => trait.trim())
    .filter(Boolean);
};

const getUploadedPetImageUrl = async (req, options = {}) => {
  if (!req.file) {
    if (options.required) {
      const error = new Error("Upload a pet image before creating the listing");
      error.statusCode = 400;
      throw error;
    }

    return undefined;
  }

  return uploadPetImageToCloudinary(req.file);
};

/*
  GET /pets

  Optional query params:
  ?search=max
  ?status=adopted
  ?shelterId=123
*/
const listPets = async (req, res, next) => {
  try {
    const search = req.query.search;
    const status = req.query.status;
    const shelterId = req.query.shelterId;

    let petStatus = "available";

    if (status) {
      petStatus = status;
    }

    const query = {
      status: petStatus,
    };

    if (shelterId) {
      query.shelterId = shelterId;
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    const pets = await Pet.find(query)
      .populate("shelterId", "name city state")
      .sort({ createdAt: -1 });

    res.json({
      data: pets,
    });
  } catch (error) {
    next(error);
  }
};

/*
  GET /pets/:petId
*/
const getPetById = async (req, res, next) => {
  try {
    const petId = req.params.petId;

    const isValidId = mongoose.Types.ObjectId.isValid(petId);

    if (!isValidId) {
      return res.status(400).json({
        message: "Invalid pet id",
      });
    }

    const pet = await Pet.findById(petId).populate(
      "shelterId",
      "name city state contactEmail contactPhone"
    );

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    res.json({
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

/*
  POST /pets
*/
const createPet = async (req, res, next) => {
  try {
    const shelter = await Shelter.findOne({
      adminUserId: req.user._id,
    }).select("_id approvalStatus");

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter profile not found",
      });
    }

    if (shelter.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Shelter must be approved before creating pets",
      });
    }

    const imageUrl = await getUploadedPetImageUrl(req, { required: true });

    const newPetData = {
      shelterId: shelter._id,
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      sex: req.body.sex,
      ageMonths: req.body.ageMonths,
      ageGroup: req.body.ageGroup,
      size: req.body.size,
      imageUrl,
      traits: parseTraits(req.body.traits),
      blurb: req.body.blurb,
      status: req.body.status || "available",
    };

    const newPet = await Pet.create(newPetData);

    res.status(201).json({
      data: newPet,
    });
  } catch (error) {
    next(error);
  }
};

/*
  PATCH /pets/:petId
*/
const updatePet = async (req, res, next) => {
  try {
    const petId = req.params.petId;

    const isValidId = mongoose.Types.ObjectId.isValid(petId);

    if (!isValidId) {
      return res.status(400).json({
        message: "Invalid pet id",
      });
    }

    const shelter = await Shelter.findOne({
      adminUserId: req.user._id,
    }).select("_id approvalStatus");

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter profile not found",
      });
    }

    if (shelter.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Shelter must be approved before updating pets",
      });
    }

    const pet = await Pet.findOne({
      _id: petId,
      shelterId: shelter._id,
    });

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    const imageUrl = await getUploadedPetImageUrl(req);

    if (req.body.name !== undefined) pet.name = req.body.name;
    if (req.body.species !== undefined) pet.species = req.body.species;
    if (req.body.breed !== undefined) pet.breed = req.body.breed;
    if (req.body.sex !== undefined) pet.sex = req.body.sex;
    if (req.body.ageMonths !== undefined) pet.ageMonths = req.body.ageMonths;
    if (req.body.ageGroup !== undefined) pet.ageGroup = req.body.ageGroup;
    if (req.body.size !== undefined) pet.size = req.body.size;
    if (imageUrl !== undefined) pet.imageUrl = imageUrl;
    if (req.body.traits !== undefined) pet.traits = parseTraits(req.body.traits);
    if (req.body.blurb !== undefined) pet.blurb = req.body.blurb;
    if (req.body.status !== undefined) pet.status = req.body.status;

    await pet.save();

    res.json({
      data: pet,
    });
  } catch (error) {
    next(error);
  }
};

/*
  DELETE /pets/:petId
*/
const deletePet = async (req, res, next) => {
  try {
    const petId = req.params.petId;

    const isValidId = mongoose.Types.ObjectId.isValid(petId);

    if (!isValidId) {
      return res.status(400).json({
        message: "Invalid pet id",
      });
    }

    const shelter = await Shelter.findOne({
      adminUserId: req.user._id,
    }).select("_id approvalStatus");

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter profile not found",
      });
    }

    if (shelter.approvalStatus !== "approved") {
      return res.status(403).json({
        message: "Shelter must be approved before deleting pets",
      });
    }

    const pet = await Pet.findOne({
      _id: petId,
      shelterId: shelter._id,
    });

    if (!pet) {
      return res.status(404).json({
        message: "Pet not found",
      });
    }

    await pet.deleteOne();

    res.json({
      message: "Pet deleted",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};