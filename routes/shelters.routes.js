const express = require("express");

const {getMyShelter} = require("../controllers/shelters.controller");

const attachCurrentUser = require("../middleware/attachCurrentUser");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/me",attachCurrentUser,requireRole("shelter_admin"),getMyShelter)

module.exports = router;