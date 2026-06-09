const express = require("express");
const { listPendingShelters,approveShelter,rejectShelter} = require("../controllers/adminShelters.controller");
const attachCurrentUser = require("../middleware/attachCurrentUser");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get("/pending",attachCurrentUser,requireRole("super_admin"),listPendingShelters);
router.patch("/:shelterId/approve",attachCurrentUser,requireRole("super_admin"),approveShelter);
router.patch("/:shelterId/reject",attachCurrentUser,requireRole("super_admin"),rejectShelter);






module.exports = router;