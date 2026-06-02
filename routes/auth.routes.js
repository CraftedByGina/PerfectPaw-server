const express = require("express");

const { register, login, me } = require("../controllers/auth.controller");
const attachCurrentUser = require("../middleware/attachCurrentUser");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", attachCurrentUser, me);

module.exports = router;
