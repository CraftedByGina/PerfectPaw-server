const mongoose = require("mongoose");
const Pet = require("../models/pet.model");
const Shelter = require("../models/shelter.model");

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
    });

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter profile not found",
      });
    }

    const newPetData = {
      ...req.body,
      shelterId: shelter._id,
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
    }).select("_id");

    if (!shelter) {
      return res.status(404).json({
        message: "Shelter profile not found",
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
  deletePet,
};