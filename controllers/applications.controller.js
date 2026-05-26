const mongoose = require("mongoose");
const Application = require("../models/application.model");
const Pet = require("../models/pet.model");
const Shelter = require("../models/shelter.model");

/*
	GET /applications
*/
const listApplications = async (req, res, next) => {
	try {
		const shelterId = req.query.shelterId;
		const adopterId = req.query.adopterId;
		const status = req.query.status;
		const courseStatus = req.query.courseStatus;

		const query = {};

		if (req.user.role === "adopter") {
			query.adopterId = req.user._id;
		}

		if (req.user.role === "shelter_admin") {
			const shelter = await Shelter.findOne({ adminUserId: req.user._id }).select("_id");

			if (!shelter) {
				return res.status(404).json({
					message: "Shelter profile not found",
				});
			}

			query.shelterId = shelter._id;
		}

		if (shelterId) {
			const isValidShelterId = mongoose.Types.ObjectId.isValid(shelterId);

			if (!isValidShelterId) {
				return res.status(400).json({
					message: "Invalid shelter id",
				});
			}

			if (req.user.role === "shelter_admin" && String(query.shelterId) !== shelterId) {
				return res.status(403).json({
					message: "Forbidden",
				});
			}

			query.shelterId = shelterId;
		}

		if (adopterId) {
			const isValidAdopterId = mongoose.Types.ObjectId.isValid(adopterId);

			if (!isValidAdopterId) {
				return res.status(400).json({
					message: "Invalid adopter id",
				});
			}

			if (req.user.role === "adopter" && String(query.adopterId) !== adopterId) {
				return res.status(403).json({
					message: "Forbidden",
				});
			}

			query.adopterId = adopterId;
		}

		if (status) {
			query.status = status;
		}

		if (courseStatus) {
			query.courseStatus = courseStatus;
		}

		const applications = await Application.find(query)
			.populate("petId")
			.populate("adopterId", "fullName email")
			.populate("shelterId", "name")
			.sort({ createdAt: -1 });

		res.json({
			data: applications,
		});
	} catch (error) {
		next(error);
	}
};

/*
	POST /applications
*/
const createApplication = async (req, res, next) => {
	try {
		const petId = req.body.petId || req.body.pet;

		if (!petId) {
			return res.status(400).json({
				message: "petId is required",
			});
		}

		const isValidPetId = mongoose.Types.ObjectId.isValid(petId);

		if (!isValidPetId) {
			return res.status(400).json({
				message: "Invalid pet id",
			});
		}

		const pet = await Pet.findById(petId).select("shelterId status");

		if (!pet) {
			return res.status(404).json({
				message: "Pet not found",
			});
		}

		if (pet.status !== "available") {
			return res.status(400).json({
				message: "Applications are only open for available pets",
			});
		}

		const newApplicationData = {
			petId: petId,
			adopterId: req.user._id,
			shelterId: pet.shelterId,
			message: req.body.message,
			status: "submitted",
			courseStatus: "pending",
		};

		const newApplication = await Application.create(newApplicationData);

		res.status(201).json({
			data: newApplication,
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({
				message: "You already applied for this pet",
			});
		}

		next(error);
	}
};

/*
	PATCH /applications/:applicationId/review
*/
const reviewApplication = async (req, res, next) => {
	try {
		const applicationId = req.params.applicationId;

		const isValidApplicationId = mongoose.Types.ObjectId.isValid(applicationId);

		if (!isValidApplicationId) {
			return res.status(400).json({
				message: "Invalid application id",
			});
		}

		const shelter = await Shelter.findOne({ adminUserId: req.user._id }).select("_id");

		if (!shelter) {
			return res.status(404).json({
				message: "Shelter profile not found",
			});
		}

		const application = await Application.findById(applicationId);

		if (!application) {
			return res.status(404).json({
				message: "Application not found",
			});
		}

		if (String(application.shelterId) !== String(shelter._id)) {
			return res.status(403).json({
				message: "Forbidden",
			});
		}

		const allowedStatuses = ["reviewing", "approved", "rejected"];
		const allowedCourseStatuses = ["pending", "passed", "failed"];

		const nextStatus = req.body.status;
		const nextCourseStatus = req.body.courseStatus;

		if (!nextStatus && !nextCourseStatus) {
			return res.status(400).json({
				message: "status or courseStatus is required",
			});
		}

		if (nextStatus && !allowedStatuses.includes(nextStatus)) {
			return res.status(400).json({
				message: "Invalid status",
			});
		}

		if (nextCourseStatus && !allowedCourseStatuses.includes(nextCourseStatus)) {
			return res.status(400).json({
				message: "Invalid courseStatus",
			});
		}

		const resolvedCourseStatus = nextCourseStatus || application.courseStatus;

		if (nextStatus === "approved" && resolvedCourseStatus !== "passed") {
			return res.status(400).json({
				message: "Course must be passed before approval",
			});
		}

		if (nextStatus) {
			application.status = nextStatus;
		}

		if (nextCourseStatus) {
			application.courseStatus = nextCourseStatus;
		}

		await application.save();

		if (application.status === "approved") {
			await Pet.findByIdAndUpdate(application.petId, { status: "adopted" });
		}

		res.json({
			data: application,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	listApplications,
	createApplication,
	reviewApplication,
};