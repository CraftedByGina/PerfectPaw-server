const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },
    adopterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
      index: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["submitted", "reviewing", "approved", "rejected", "withdrawn"],
      default: "submitted",
      index: true,
    },
    courseStatus: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
      index: true,
    },
    courseScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    courseTotalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    courseCompletedAt: {
      type: Date,
      default: null,
    },
    courseVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ adopterId: 1, petId: 1 }, { unique: true });
applicationSchema.index({ shelterId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);