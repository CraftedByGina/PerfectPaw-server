require("dotenv").config();

const mongoose = require("mongoose");
const connectMongo = require("../db/connectMongo");
const Pet = require("../models/pet.model");
const Shelter = require("../models/shelter.model");
const User = require("../models/user.model");

const PETS = [
  {
    name: "Buddy",
    species: "Dog",
    breed: "Labrador Retriever Mix",
    sex: "Male",
    ageMonths: 24,
    ageGroup: "Young",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=1",
    traits: ["Friendly", "Active", "Good with kids", "Good with dogs"],
    blurb: "Loves fetch, belly rubs, and long walks with people.",
  },
  {
    name: "Luna",
    species: "Cat",
    breed: "Domestic Shorthair",
    sex: "Female",
    ageMonths: 18,
    ageGroup: "Young",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Sweet", "Calm", "Good with cats", "Litter trained"],
    blurb: "A gentle window watcher who warms up with soft voices.",
  },
  {
    name: "Max",
    species: "Dog",
    breed: "German Shepherd Mix",
    sex: "Male",
    ageMonths: 48,
    ageGroup: "Adult",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=2",
    traits: ["Gentle", "Smart", "Good with kids", "Leash trained"],
    blurb: "A loyal companion who thinks he's a lap dog.",
  },
  {
    name: "Bella",
    species: "Dog",
    breed: "Beagle Mix",
    sex: "Female",
    ageMonths: 60,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=3",
    traits: ["Playful", "Curious", "Good with dogs"],
    blurb: "Always ready for an adventure and a snack.",
  },
  {
    name: "Oliver",
    species: "Cat",
    breed: "Orange Tabby",
    sex: "Male",
    ageMonths: 96,
    ageGroup: "Senior",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Independent", "Quiet home", "Litter trained"],
    blurb: "Enjoys sunny windows and supervising household activities.",
  },
  {
    name: "Daisy",
    species: "Dog",
    breed: "Australian Cattle Dog Mix",
    sex: "Female",
    ageMonths: 36,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=4",
    traits: ["Energetic", "Smart", "Good with teens"],
    blurb: "Can turn any walk into an exciting expedition.",
  },
  {
    name: "Charlie",
    species: "Dog",
    breed: "Poodle Mix",
    sex: "Male",
    ageMonths: 14,
    ageGroup: "Young",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=5",
    traits: ["Friendly", "Quick learner", "Good with kids"],
    blurb: "A quick learner who loves showing off new tricks.",
  },
  {
    name: "Milo",
    species: "Cat",
    breed: "Tuxedo",
    sex: "Male",
    ageMonths: 8,
    ageGroup: "Puppy",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Playful", "Good with cats", "Kitten energy"],
    blurb: "Will chase anything that moves, including shadows.",
  },
  {
    name: "Sadie",
    species: "Dog",
    breed: "Great Pyrenees Mix",
    sex: "Female",
    ageMonths: 108,
    ageGroup: "Senior",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=6",
    traits: ["Gentle", "Patient", "Good with kids"],
    blurb: "A calm companion who loves slow strolls.",
  },
  {
    name: "Leo",
    species: "Cat",
    breed: "Siamese Mix",
    sex: "Male",
    ageMonths: 42,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med&breed_ids=siam",
    traits: ["Social", "Confident", "Good with adults"],
    blurb: "Greets every visitor like they came just for him.",
  },
  {
    name: "Rosie",
    species: "Dog",
    breed: "Chihuahua Mix",
    sex: "Female",
    ageMonths: 72,
    ageGroup: "Adult",
    size: "Small",
    imageUrl: "https://placedog.net/800/600?id=7",
    traits: ["Loving", "Apartment friendly", "Lap dog"],
    blurb: "Tiny body, huge personality.",
  },
  {
    name: "Rocky",
    species: "Dog",
    breed: "Boxer Mix",
    sex: "Male",
    ageMonths: 30,
    ageGroup: "Young",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=8",
    traits: ["Goofy", "Active", "Good with dogs"],
    blurb: "Keeps watch over everyone and everything.",
  },
  {
    name: "Coco",
    species: "Cat",
    breed: "Calico",
    sex: "Female",
    ageMonths: 24,
    ageGroup: "Young",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Gentle", "Quiet", "Litter trained"],
    blurb: "Prefers cozy blankets and peaceful afternoons.",
  },
  {
    name: "Finn",
    species: "Dog",
    breed: "Border Collie Mix",
    sex: "Male",
    ageMonths: 54,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=9",
    traits: ["Adventurous", "Smart", "Good hiking buddy"],
    blurb: "Would happily hike all day and cuddle all night.",
  },
  {
    name: "Nala",
    species: "Cat",
    breed: "Maine Coon Mix",
    sex: "Female",
    ageMonths: 120,
    ageGroup: "Senior",
    size: "Medium",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med&breed_ids=mcoo",
    traits: ["Affectionate", "Calm", "Good with seniors"],
    blurb: "An experienced nap expert with a heart of gold.",
  },
  {
    name: "Pepper",
    species: "Dog",
    breed: "Miniature Schnauzer Mix",
    sex: "Female",
    ageMonths: 10,
    ageGroup: "Puppy",
    size: "Small",
    imageUrl: "https://placedog.net/800/600?id=10",
    traits: ["Puppy energy", "Good with kids", "Playful"],
    blurb: "A bright little pup learning manners and loving every minute.",
  },
  {
    name: "Simba",
    species: "Cat",
    breed: "Brown Tabby",
    sex: "Male",
    ageMonths: 36,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Friendly", "Good with cats", "Litter trained"],
    blurb: "A confident tabby who loves head scratches.",
  },
  {
    name: "Ruby",
    species: "Dog",
    breed: "Pit Bull Terrier Mix",
    sex: "Female",
    ageMonths: 66,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=11",
    traits: ["Affectionate", "House trained", "Good with adults"],
    blurb: "A couch buddy with a big smile and bigger heart.",
  },
  {
    name: "Jasper",
    species: "Cat",
    breed: "Russian Blue Mix",
    sex: "Male",
    ageMonths: 72,
    ageGroup: "Adult",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med&breed_ids=rblu",
    traits: ["Quiet", "Independent", "Apartment friendly"],
    blurb: "A peaceful roommate who enjoys a steady routine.",
  },
  {
    name: "Hazel",
    species: "Dog",
    breed: "Corgi Mix",
    sex: "Female",
    ageMonths: 28,
    ageGroup: "Young",
    size: "Small",
    imageUrl: "https://placedog.net/800/600?id=12",
    traits: ["Cheerful", "Good with kids", "Good with dogs"],
    blurb: "Short legs, huge enthusiasm, and lots of tail wags.",
  },
  {
    name: "Oreo",
    species: "Cat",
    breed: "Domestic Medium Hair",
    sex: "Male",
    ageMonths: 6,
    ageGroup: "Puppy",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Kitten energy", "Playful", "Good with cats"],
    blurb: "A tiny explorer who turns every box into a playground.",
  },
  {
    name: "Moose",
    species: "Dog",
    breed: "Mastiff Mix",
    sex: "Male",
    ageMonths: 84,
    ageGroup: "Adult",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=13",
    traits: ["Gentle giant", "Calm", "Good with kids"],
    blurb: "Big paws, soft eyes, and a very relaxed approach to life.",
  },
  {
    name: "Poppy",
    species: "Cat",
    breed: "Tortoiseshell",
    sex: "Female",
    ageMonths: 48,
    ageGroup: "Adult",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Curious", "Litter trained", "Good with adults"],
    blurb: "A clever girl who likes toys, treats, and her own sunny spot.",
  },
  {
    name: "Winston",
    species: "Dog",
    breed: "Basset Hound Mix",
    sex: "Male",
    ageMonths: 132,
    ageGroup: "Senior",
    size: "Medium",
    imageUrl: "https://placedog.net/800/600?id=14",
    traits: ["Senior sweetheart", "Calm", "Good with seniors"],
    blurb: "A slow-walking gentleman who appreciates soft beds.",
  },
  {
    name: "Maggie",
    species: "Dog",
    breed: "Golden Retriever Mix",
    sex: "Female",
    ageMonths: 18,
    ageGroup: "Young",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=15",
    traits: ["Friendly", "Good with kids", "Good with dogs"],
    blurb: "A sunny young dog who makes friends everywhere she goes.",
  },
  {
    name: "Ziggy",
    species: "Cat",
    breed: "Black Domestic Shorthair",
    sex: "Male",
    ageMonths: 20,
    ageGroup: "Young",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Playful", "Social", "Litter trained"],
    blurb: "A silly, social cat who likes to be part of the action.",
  },
  {
    name: "Athena",
    species: "Dog",
    breed: "Husky Mix",
    sex: "Female",
    ageMonths: 40,
    ageGroup: "Adult",
    size: "Large",
    imageUrl: "https://placedog.net/800/600?id=16",
    traits: ["Active", "Talkative", "Good with experienced owners"],
    blurb: "A smart, energetic dog who loves enrichment and adventure.",
  },
  {
    name: "Willow",
    species: "Cat",
    breed: "Dilute Calico",
    sex: "Female",
    ageMonths: 156,
    ageGroup: "Senior",
    size: "Small",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Senior sweetheart", "Quiet home", "Affectionate"],
    blurb: "A soft senior cat looking for a peaceful lap.",
  },
  {
    name: "Scout",
    species: "Dog",
    breed: "Terrier Mix",
    sex: "Male",
    ageMonths: 7,
    ageGroup: "Puppy",
    size: "Small",
    imageUrl: "https://placedog.net/800/600?id=17",
    traits: ["Puppy energy", "Playful", "Good with dogs"],
    blurb: "A little adventurer learning the world one sniff at a time.",
  },
  {
    name: "Ginger",
    species: "Cat",
    breed: "Ginger Tabby",
    sex: "Female",
    ageMonths: 60,
    ageGroup: "Adult",
    size: "Medium",
    imageUrl: "https://api.thecatapi.com/v1/images/search?format=src&mime_types=jpg&size=med",
    traits: ["Affectionate", "Good with kids", "Litter trained"],
    blurb: "A warm, friendly cat who likes gentle attention.",
  },
];

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
      approvalStatus: "approved",
    });
    console.log("Created seed shelter.");
  } else {
    shelter.approvalStatus = "approved";
    shelter.isVerified = true;
    await shelter.save();
    console.log("Using existing seed shelter.");
  }

  return shelter;
}

function buildPetDocuments(shelterId) {
  return PETS.map((pet) => ({
    shelterId,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    ageMonths: pet.ageMonths,
    ageGroup: pet.ageGroup,
    size: pet.size,
    imageUrl: pet.imageUrl,
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
