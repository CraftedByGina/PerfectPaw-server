const mongoose = require("mongoose");

const shelterSchema = new mongoose.Schema(
  {
    adminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    contactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    zipCode: {
      type: String,
      trim: true,
      default: "",
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    facebookUrl: {
      type: String,
      trim: true,
      default: "",
    },
    instagramUrl: {
      type: String,
      trim: true,
      default: "",
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    missionStatement: {
      type: String,
      trim: true,
      default: "",
    },
    animalTypes: {
      type: [String],
      default: [],
    },
    yearsOperating: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shelter", shelterSchema);