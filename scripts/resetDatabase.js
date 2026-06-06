require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");

const resetDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }

  await connectMongo(mongoUri);

  console.log("Deleting all database data...");
  await mongoose.connection.dropDatabase();

  console.log("Database reset complete.");

  await mongoose.connection.close();
};

resetDatabase().catch((error) => {
  console.error("Reset failed:", error.message);
  process.exit(1);
});