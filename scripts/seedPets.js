require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const Pet = require("../models/pet.model");
const Shelter = require("../models/shelter.model");
const User = require("../models/user.model");

const PETS = [
  {
    name: "Buddy",
    sex: "Male",
    age: 2,
    ageGroup: "Young",
    size: "Large",
    img: "/images/dog.png",
    traits: ["Friendly", "Active"],
    blurb: "Loves fetch, belly rubs, and stealing socks.",
  },
  {
    name: "Luna",
    sex: "Female",
    age: 1,
    ageGroup: "Young",
    size: "Small",
    img: "/images/cat.png",
    traits: ["Sweet", "Calm"],
    blurb: "Will judge you silently, then fall asleep on you.",
  },
  {
    name: "Max",
    sex: "Male",
    age: 3,
    ageGroup: "Adult",
    size: "Large",
    img: "/images/dog.png",
    traits: ["Gentle", "Goofy"],
    blurb: "Gentle giant who thinks he's a lap dog.",
  },
  {
    name: "Bella",
    sex: "Female",
    age: 5,
    ageGroup: "Adult",
    size: "Medium",
    img: "/images/dog.png",
    traits: ["Loyal", "Playful"],
    blurb: "Always ready for an adventure and a snack.",
  },
  {
    name: "Oliver",
    sex: "Male",
    age: 7,
    ageGroup: "Senior",
    size: "Small",
    img: "/images/cat.png",
    traits: ["Independent", "Curious"],
    blurb: "Enjoys sunny windows and supervising household activities.",
  },
  {
    name: "Daisy",
    sex: "Female",
    age: 4,
    ageGroup: "Adult",
    size: "Medium",
    img: "/images/dog.png",
    traits: ["Energetic", "Affectionate"],
    blurb: "Can turn any walk into an exciting expedition.",
  },
  {
    name: "Charlie",
    sex: "Male",
    age: 2,
    ageGroup: "Young",
    size: "Medium",
    img: "/images/dog.png",
    traits: ["Smart", "Friendly"],
    blurb: "Quick learner who loves showing off new tricks.",
  },
  {
    name: "Milo",
    sex: "Male",
    age: 1,
    ageGroup: "Young",
    size: "Small",
    img: "/images/cat.png",
    traits: ["Mischievous", "Playful"],
    blurb: "Will chase anything that moves, including shadows.",
  },
  {
    name: "Sadie",
    sex: "Female",
    age: 8,
    ageGroup: "Senior",
    size: "Large",
    img: "/images/dog.png",
    traits: ["Gentle", "Patient"],
    blurb: "A calm companion who loves slow strolls.",
  },
  {
    name: "Leo",
    sex: "Male",
    age: 4,
    ageGroup: "Adult",
    size: "Medium",
    img: "/images/cat.png",
    traits: ["Confident", "Social"],
    blurb: "Greets every visitor like they came just for him.",
  },
  {
    name: "Rosie",
    sex: "Female",
    age: 6,
    ageGroup: "Adult",
    size: "Small",
    img: "/images/dog.png",
    traits: ["Cheerful", "Loving"],
    blurb: "Tiny body, huge personality.",
  },
  {
    name: "Rocky",
    sex: "Male",
    age: 3,
    ageGroup: "Adult",
    size: "Large",
    img: "/images/dog.png",
    traits: ["Brave", "Protective"],
    blurb: "Keeps watch over everyone and everything.",
  },
  {
    name: "Coco",
    sex: "Female",
    age: 2,
    ageGroup: "Young",
    size: "Small",
    img: "/images/cat.png",
    traits: ["Gentle", "Quiet"],
    blurb: "Prefers cozy blankets and peaceful afternoons.",
  },
  {
    name: "Finn",
    sex: "Male",
    age: 5,
    ageGroup: "Adult",
    size: "Medium",
    img: "/images/dog.png",
    traits: ["Adventurous", "Happy"],
    blurb: "Would happily hike all day and cuddle all night.",
  },
  {
    name: "Nala",
    sex: "Female",
    age: 9,
    ageGroup: "Senior",
    size: "Medium",
    img: "/images/cat.png",
    traits: ["Wise", "Affectionate"],
    blurb: "An experienced nap expert with a heart of gold.",
  },
];

function getSpeciesFromImage(imgPath) {
  if (imgPath.includes("dog")) return "Dog";
  if (imgPath.includes("cat")) return "Cat";
  throw new Error(`Could not detect species from image path: ${imgPath}`);
}

async function getOrCreateSeedAdmin() {
  const adminEmail = "seed-shelter-admin@perfectpaw.local";

  let adminUser = await User.findOne({ email: adminEmail });

  if (!adminUser) {
    adminUser = await User.create({
      fullName: "Seed Shelter Admin",
      email: adminEmail,
      passwordHash: "seed-placeholder-hash",
      role: "shelter_admin",
      isActive: true,
    });
    console.log("Created seed shelter admin user.");
  } else {
    console.log("Using existing seed shelter admin user.");
  }

  return adminUser;
}

async function getOrCreateSeedShelter(adminUserId) {
  let shelter = await Shelter.findOne({ adminUserId });

  if (!shelter) {
    shelter = await Shelter.create({
      adminUserId,
      name: "PerfectPaw Seed Shelter",
      contactEmail: "seed-shelter-admin@perfectpaw.local",
      contactPhone: "",
      city: "New York",
      state: "NY",
      isVerified: true,
    });
    console.log("Created seed shelter.");
  } else {
    console.log("Using existing seed shelter.");
  }

  return shelter;
}

function buildPetDocuments(shelterId) {
  return PETS.map((pet) => ({
    shelterId,
    name: pet.name,
    species: getSpeciesFromImage(pet.img),
    sex: pet.sex,
    age: pet.age,
    ageGroup: pet.ageGroup,
    size: pet.size,
    imageUrl: pet.img,
    traits: pet.traits,
    blurb: pet.blurb,
    status: "available",
  }));
}

async function seedPets() {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI in .env");
  }

  console.log("Connecting to MongoDB...");
  await connectMongo(mongoUri);

  const adminUser = await getOrCreateSeedAdmin();
  const shelter = await getOrCreateSeedShelter(adminUser._id);

  const petsToInsert = buildPetDocuments(shelter._id);

  await Pet.deleteMany({ shelterId: shelter._id });
  const insertedPets = await Pet.insertMany(petsToInsert);

  console.log(`Seed complete. Inserted ${insertedPets.length} pets.`);
  console.log(`Shelter id: ${shelter._id}`);
}

seedPets()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
