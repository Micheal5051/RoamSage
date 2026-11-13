require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Destination = require("../models/Destination");
const destinations = require("../data/destinations");

async function seedDestinations() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI was not found. Check that server/.env exists.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let inserted = 0;
  let normalized = 0;
  let alreadyPresent = 0;

  for (const destination of destinations) {
    const escapedName = destination.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Destination.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" }
    }).sort({ _id: 1 });

    if (existing) {
      const needsNormalization =
        existing.name !== destination.name ||
        existing.country !== destination.country ||
        Number(existing.latitude) !== Number(destination.latitude) ||
        Number(existing.longitude) !== Number(destination.longitude);

      if (needsNormalization) {
        await Destination.findByIdAndUpdate(
          existing._id,
          {
            $set: {
              name: destination.name,
              country: destination.country,
              latitude: destination.latitude,
              longitude: destination.longitude
            }
          },
          { new: true, runValidators: true }
        );
        normalized += 1;
        console.log(`NORMALIZED: ${destination.name}`);
      } else {
        alreadyPresent += 1;
        console.log(`VERIFIED (already correct): ${destination.name}`);
      }
      continue;
    }

    await Destination.create(destination);
    inserted += 1;
    console.log(`ADDED: ${destination.name}`);
  }

  const total = await Destination.countDocuments();
  console.log("\nDestination seeding finished.");
  console.log(`New records added: ${inserted}`);
  console.log(`Existing records normalized: ${normalized}`);
  console.log(`Existing records already correct: ${alreadyPresent}`);
  console.log(`Total destination records in database: ${total}`);
}

seedDestinations()
  .catch((error) => {
    console.error("\nDestination seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
