const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      enum: ["Dog", "Cat"],
      required: true,
    },
    breed: {
      type: String,
      trim: true,
      default: "",
    },
    sex: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    ageMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 240,
    },
    ageGroup: {
      type: String,
      enum: ["Puppy", "Young", "Adult", "Senior"],
      required: true,
    },
    size: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    traits: {
      type: [String],
      default: [],
    },
    blurb: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["available", "pending", "adopted"],
      default: "available",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

petSchema.index({ shelterId: 1, status: 1 });
petSchema.index({ name: "text", blurb: "text", traits: "text" });

module.exports = mongoose.model("Pet", petSchema);