const Pet = require("../models/pet.model");
const { matchPetsForAdopter } = require('../services/petMatchAgent.services');


const matchPets = async (req, res, next) => {
    try {
        const preferences = req.body || {};
        const pets = await Pet.find({ status: 'available' })
        .select("name species breed sex ageMonths ageGroup size energyLevel goodForApartments goodWithKids goodWithOtherPets exerciseNeeds traits blurb imageUrl shelterId")
        .limit(25);

        if (pets.length === 0) {
            return res.json({ matches: [], message: 'No available pets found' });

        }
        const result = await matchPetsForAdopter({
            preferences,
            pets,
        });
        res.json(result);
    } catch (error) {
        next(error)
    }
}

module.exports = {
    matchPets,
};