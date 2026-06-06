require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const User = require("../models/user.model");
const Shelter = require("../models/shelter.model");
const bcrypt = require("bcryptjs");

const seedPassword = 'shelter-admin-password123'
const seedShelters = [
  {
    adminName: "Main Shelter Admin",
    adminEmail: "main-shelter-admin@perfectpaw.local",
    shelterName: "PerfectPaw Main Branch",
    city: "New York",
    state: "NY",
  },
  {
    adminName: "Northside Shelter Admin",
    adminEmail: "northside-shelter-admin@perfectpaw.local",
    shelterName: "Northside Animal Shelter",
    city: "Chicago",
    state: "IL",
  },
  {
    adminName: "Southside Shelter Admin",
    adminEmail: "southside-shelter-admin@perfectpaw.local",
    shelterName: "Southside Animal Shelter",
    city: "Los Angeles",
    state: "CA",
  },
];
async function seedSheltersData() {
  const mongoUri = process.env.MONGO_URI || "";
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }
  await connectMongo(mongoUri);
  const passwordHash = await bcrypt.hash(seedPassword, 10);
  for (const shelterInfo of seedShelters) {
    let admin = await User.findOne({ email: shelterInfo.adminEmail });
    if (!admin) {
      admin = await User.create({
        fullName: shelterInfo.adminName,
        email: shelterInfo.adminEmail,
        passwordHash: passwordHash,
        role: "shelter_admin",
        isActive: true,
      });
      console.log(`Created admin: ${admin.email}`);
    } else {
      admin.fullName = shelterInfo.adminName;
      admin.passwordHash = passwordHash;
      admin.role = "shelter_admin";
      admin.isActive = true;
      await admin.save();
      console.log(`Updated admin: ${admin.email}`);
    }
    await Shelter.deleteMany({ adminUserId: admin._id });
    const shelter = await Shelter.create({
      adminUserId: admin._id,
      name: shelterInfo.shelterName,
      contactEmail: shelterInfo.adminEmail,
      contactPhone: "",
      address: "",
      city: shelterInfo.city,
      state: shelterInfo.state,
      zipCode: "",
      website: "",
      licenseNumber: "SEED-LICENSE",
      missionStatement: "Seed shelter for local development.",
      animalTypes: ["Dog", "Cat"],
      yearsOperating: 5,
      approvalStatus: "approved",
      isVerified: true,
    });
    console.log(`Created shelter: ${shelter.name}`);
  }
  console.log("Seed complete. All shelters created.");
}
seedSheltersData()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });