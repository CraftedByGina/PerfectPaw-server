const express = require('express');

const { matchPets } = require("../controllers/agent.controller");

const router = express.Router();

router.post('/match', matchPets);

module.exports = router;
