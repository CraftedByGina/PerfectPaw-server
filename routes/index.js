const express = require("express");

const authRoutes = require("./auth.routes");
const petRoutes = require("./pets.routes");
const applicationRoutes = require("./applications.routes");
const adminShelterRoutes = require("./adminShelter.routes");
const shelterRoutes = require("./shelters.routes");
const agentRoutes = require("./agent.routes");



const router = express.Router();

router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/applications", applicationRoutes);
router.use("/admin/shelters", adminShelterRoutes);
router.use("/shelters", shelterRoutes);
router.use("/agent", agentRoutes);


module.exports = router;
