require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const User = require("../models/user.model");
const Shelter = require("../models/shelter.model");
const bcrypt = require("bcryptjs");

const seedPassword = "shelter-admin-password123";

const seedShelters = [
  {
    adminName: "Seed Shelter Admin",
    adminEmail: "seed-shelter-admin@perfectpaw.local",
    shelterName: "PerfectPaw Rescue Center",
    city: "New York",
    state: "NY",
    contactPhone: "212-555-0198",
    address: "100 Pawprint Lane",
    zipCode: "10001",
    website: "https://perfectpaw.local",
    licenseNumber: "PP-SEED-001",
    yearsOperating: 8,
    missionStatement: "PerfectPaw Rescue Center connects pets with adopters through careful matching, education, and ongoing support.",
  },
  {
    adminName: "Lucky Dog Refuge Admin",
    adminEmail: "lucky-dog-admin@perfectpaw.local",
    shelterName: "Lucky Dog Refuge",
    city: "Stamford",
    state: "CT",
    contactPhone: "203-555-0144",
    address: "25 Rescue Road",
    zipCode: "06901",
    website: "https://www.luckydogrefuge.com/",
    licenseNumber: "LD-SEED-001",
    yearsOperating: 6,
    missionStatement: "Lucky Dog Refuge helps dogs find safe, loving homes through thoughtful rescue, care, and adoption support.",
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
    let shelter = await Shelter.findOne({ adminUserId: admin._id });

    if (!shelter) {
      shelter = new Shelter({ adminUserId: admin._id });
    }

    shelter.name = shelterInfo.shelterName;
    shelter.contactEmail = shelterInfo.adminEmail;
    shelter.contactPhone = shelterInfo.contactPhone || "";
    shelter.address = shelterInfo.address || "";
    shelter.city = shelterInfo.city;
    shelter.state = shelterInfo.state;
    shelter.zipCode = shelterInfo.zipCode || "";
    shelter.website = shelterInfo.website || "";
    shelter.licenseNumber = shelterInfo.licenseNumber || "SEED-LICENSE";
    shelter.missionStatement = shelterInfo.missionStatement || "Seed shelter for local development.";
    shelter.animalTypes = ["Dog", "Cat"];
    shelter.yearsOperating = shelterInfo.yearsOperating || 5;
    shelter.approvalStatus = "approved";
    shelter.isVerified = true;

    await shelter.save();
    console.log(`Seeded shelter: ${shelter.name}`);
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