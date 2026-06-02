require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const User = require("../models/user.model");

const SEED_USERS = [
  {
    fullName: " Admin Shelter One",
    email: "seed-shelter-admin@perfectpaw.local",
    passwordHash: "seed-placeholder-passwordhash",
    role: "shelter_admin",
    isActive: true,
  },
  {
    fullName: "  Adopter One",
    email: "seed-adopter-1@perfectpaw.local",
    passwordHash: "seed-placeholder-passwordhash",
    role: "adopter",
    isActive: true,
  },
  {
    fullName: " Adopter Two",
    email: "seed-adopter-2@perfectpaw.local",
    passwordHash: "seed-placeholder-passwordhash",
    role: "adopter",
    isActive: true,
  },
  {
    fullName: " Admin Super Admin",
    email: "seed-super-admin@perfectpaw.local",
    passwordHash: "seed-placeholder-passwordhash",
    role: "super_admin",
    isActive: true,
  },
];

async function seedUsers() {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await connectMongo(mongoUri);

  const emails = SEED_USERS.map((u) => u.email);

  await User.deleteMany({ email: { $in: emails } });

  const insertedUsers = await User.insertMany(SEED_USERS);

  console.log(`Seed complete. Inserted ${insertedUsers.length} users.`);
}

seedUsers()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
