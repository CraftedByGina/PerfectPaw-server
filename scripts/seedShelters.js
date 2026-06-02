require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const User = require("../models/user.model");
const Shelter = require("../models/shelter.model");

async function ensureShelterAdmin() {
  const email = "seed-shelter-admin@perfectpaw.local";

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      fullName: "Seed Shelter Admin",
      email,
      passwordHash: "seed-placeholder-passwordhash",
      role: "shelter_admin",
      isActive: true,
    });
    console.log("Created seed shelter admin user.");
  }

  return admin;
}

async function seedShelters() {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await connectMongo(mongoUri);

  const admin = await ensureShelterAdmin();

  await Shelter.deleteMany({ adminUserId: admin._id });

  const shelter = await Shelter.create({
    adminUserId: admin._id,
    name: "PerfectPaw Seed Shelter",
    contactEmail: "seed-shelter-admin@perfectpaw.local",
    contactPhone: "",
    city: "New York",
    state: "NY",
    isVerified: true,
  });

  console.log(`Seed complete. Shelter created: ${shelter.name}`);
}

seedShelters()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
