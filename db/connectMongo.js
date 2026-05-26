const mongoose = require("mongoose");

const connectMongo = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in environment variables");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
};

module.exports = connectMongo;
