const express = require("express");

const authRoutes = require("./auth.routes");
const petRoutes = require("./pets.routes");
const applicationRoutes = require("./applications.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/applications", applicationRoutes);


module.exports = router;
