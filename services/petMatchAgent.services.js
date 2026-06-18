const { z } = require("zod");

const matchSchema = z.object({
    quizSummary:z.string(),
    matches: z.array(
        z.object({
            petId: z.string(),
            matchScore: z.number().min(1).max(100),
            reason: z.string(),
            idealHome: z.string()
        })
    )
})

const getChatModel = async () => {
    const { ChatAnthropic } = await import("@langchain/anthropic");

    return new ChatAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: process.env.ANTHROPIC_MODEL,
        temperature: 0.4,
    });
}

const buildPetSummary = (pet) => ({
    petId: String(pet._id),
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    ageMonths: pet.ageMonths,
    ageGroup: pet.ageGroup,
    size: pet.size,
    energyLevel: pet.energyLevel,
    goodForApartments: pet.goodForApartments,
    goodWithKids: pet.goodWithKids,
    goodWithOtherPets: pet.goodWithOtherPets,
    exerciseNeeds: pet.exerciseNeeds,
    traits: pet.traits,
    blurb: pet.blurb,
})

const matchPetsForAdopter = async({ preferences, pets}) => {
    const model = await getChatModel();
    const structuredModel = model.withStructuredOutput(matchSchema);

    const petsummaries = pets.map(buildPetSummary);
    return structuredModel.invoke([
        {
            role:'system',
            content:
            "You are PerfectPaw's pet matchmaking assistant. Recommend adoptable pets honestly and kindly. Only choose from the provided pets",
        },
        {
            role:"user",
            content: JSON.stringify({
                adopterPreferences:preferences,
                availablePets: petsummaries,
               instructions:
               "Rank the best 3 to 5 pets. Use the adopter's hobbies, home vibe, weekend style, energy preference, experience level, and practical living situation. Prioritize shelter-provided fields like energyLevel, exerciseNeeds, goodForApartments, goodWithKids, goodWithOtherPets, traits, and blurb. Do not recommend pets based only on breed.Treat unknown compatibility fields as unknown, not as a negative. Do not penalize a pet for missing compatibility information unless the adopter has a strict requirement. Breed can be considered, but the individual pet's details matter more. Keep the tone warm, fun, and adoption-focused."
            }),
        },
    ]);
};

module.exports = {
    matchPetsForAdopter,
};