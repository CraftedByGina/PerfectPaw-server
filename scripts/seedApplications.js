require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const User = require("../models/user.model");
const Pet = require("../models/pet.model");

async function ensureAdopter() {
  const email = "seed-adopter-1@perfectpaw.local";

  let adopter = await User.findOne({ email });

  if (!adopter) {
    adopter = await User.create({
      fullName: "Seed Adopter One",
      email,
      passwordHash: "seed-placeholder-passwordhash",
      role: "adopter",
      isActive: true,
    });
    console.log("Created seed adopter user.");
  }

  return adopter;
}

async function seedApplications() {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await connectMongo(mongoUri);

  const adopter = await ensureAdopter();

  const pets = await Pet.find({ status: "available" }).limit(3).select("_id shelterId name");

  if (pets.length === 0) {
    console.log("No available pets found. Run npm run seed:pets first.");
    return;
  }

  const applicationsCollection = mongoose.connection.collection("applications");

  await applicationsCollection.deleteMany({ adopterId: adopter._id });

  const docs = pets.map((pet, index) => ({
    petId: pet._id,
    adopterId: adopter._id,
    shelterId: pet.shelterId,
    message: `I would love to adopt ${pet.name}. This is seed application #${index + 1}.`,
    status: "submitted",
    courseStatus: "pending",
    courseScore: 0,
    courseTotalQuestions: 0,
    courseCompletedAt: null,
    courseVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const result = await applicationsCollection.insertMany(docs);

  console.log(`Seed complete. Inserted ${result.insertedCount} applications.`);
}

seedApplications()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
