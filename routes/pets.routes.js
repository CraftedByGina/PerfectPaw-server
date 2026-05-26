const express = require("express");

const {
	listPets,
	getPetById,
	createPet,
	deletePet,
} = require("../controllers/pets.controller");
const attachCurrentUser = require("../middleware/attachCurrentUser");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/", listPets);
router.get("/:petId", getPetById);
router.post("/", attachCurrentUser, requireRole("shelter_admin"), createPet);
router.delete("/:petId", attachCurrentUser, requireRole("shelter_admin"), deletePet);



module.exports = router;