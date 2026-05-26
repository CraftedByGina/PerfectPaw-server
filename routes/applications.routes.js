const express = require("express");

const {
	listApplications,
	createApplication,
	submitCourseResult,
	reviewApplication,
} = require("../controllers/applications.controller");
const attachCurrentUser = require("../middleware/attachCurrentUser");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.get(
	"/",
	attachCurrentUser,
	requireRole("adopter", "shelter_admin", "super_admin"),
	listApplications
);
router.post("/", attachCurrentUser, requireRole("adopter"), createApplication);
router.patch(
	"/:applicationId/course",
	attachCurrentUser,
	requireRole("adopter"),
	submitCourseResult
);
router.patch(
	"/:applicationId/review",
	attachCurrentUser,
	requireRole("shelter_admin", "super_admin"),
	reviewApplication
);


module.exports = router;
