const Shelter = require('../models/shelter.model');

/*
  GET /admin/shelters
*/
const listPendingShelters = async (req, res, next) => {
    try {
        const shelters = await Shelter.find({ approvalStatus: "pending" })
            .populate("adminUserId", "fullName email")
            .sort({ createdAt: -1 });

        res.json({
            data: shelters,
        });
    } catch (error) {
        next(error);
    }
}
/*
  POST /admin/shelters/:shelterId/approve
*/
const approveShelter = async (req, res, next) => {
    try {
        const shelterId = req.params.shelterId;

        const shelter = await Shelter.findById(shelterId);

        if (!shelter) {
            return res.status(404).json({
                message: "Shelter not found",
            });
        }
        shelter.approvalStatus = "approved";
        shelter.isVerified = true;
        shelter.reviewedAt = new Date();
        shelter.reviewedBy = req.user._id;

        await shelter.save();

        res.json({
            data: shelter
        });
    } catch (error) {
        next(error);
    }

}

/*
  POST /admin/shelters/:shelterId/reject
*/
const rejectShelter = async (req, res, next) => {
    try {
        const shelterId = req.params.shelterId;
        const reviewNotes = req.body.reviewNotes || "";

        const shelter = await Shelter.findById(shelterId);

        if (!shelter) {
            return res.status(404).json({
                message: "Shelter not found",
            });
        }
        shelter.approvalStatus = "rejected";
        shelter.isVerified = false;
        shelter.reviewNotes = reviewNotes;
        shelter.reviewedAt = new Date();
        shelter.reviewedBy = req.user._id;

        await shelter.save();

        res.json({
            data: shelter,
        })
    } catch (error) {
        next(error)

    }
}
module.exports = { listPendingShelters, approveShelter, rejectShelter };