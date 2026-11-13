
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Destination = require("./models/Destination");

const destinationData = require("./data/destinations");

async function syncDestinationImages() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from your .env file.");
    }

    // Support either an exported array or an object containing destinations.
    const destinations = Array.isArray(destinationData)
      ? destinationData
      : destinationData.destinations;

    if (!Array.isArray(destinations)) {
      throw new Error(
        "Could not find the destinations array in data/destinations.js."
      );
    }

    // All 32 approved destination images, including Hyderabad and Goa.
    const imageRecords = destinations.filter((destination) =>
      typeof destination.image === "string" &&
      destination.image.trim() !== "" &&
      /^https?:\/\//i.test(destination.image.trim())
    );

    if (destinations.length !== 32 || imageRecords.length !== 32) {
      throw new Error(
        `Expected 32 destinations with approved image URLs, but found ${destinations.length} destinations and ${imageRecords.length} images. No database changes made.`
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected!");

    // Check that every destination exists before updating anything.
    const names = imageRecords.map((destination) =>
      destination.name.trim()
    );

    const existingDestinations = await Destination.find({
      name: { $in: names }
    }).select("name");

    const existingNames = new Set(
      existingDestinations.map((destination) =>
        destination.name.trim().toLowerCase()
      )
    );

    const missingNames = names.filter(
      (name) => !existingNames.has(name.toLowerCase())
    );

    if (missingNames.length > 0) {
      throw new Error(
        `These destinations were not found in MongoDB: ${missingNames.join(", ")}. No database changes made.`
      );
    }

    // Update ONLY the image field.
    const operations = imageRecords.map((destination) => ({
      updateOne: {
        filter: { name: destination.name.trim() },
        update: {
          $set: {
            image: destination.image.trim()
          }
        }
      }
    }));

    const result = await Destination.bulkWrite(operations);

    console.log("\nDestination image sync completed!");
    console.log("Matched records:", result.matchedCount);
    console.log("Modified records:", result.modifiedCount);
    console.log("All 32 destinations, including Hyderabad and Goa, were included.");
    console.log("Only the image field was updated; other destination fields were unchanged.");

    // Verify the saved image fields.
    const verification = await Destination.find({
      name: { $in: names }
    }).select("name image");

    const missingImages = verification.filter(
      (destination) => !destination.image
    );

    console.log(
      "Destinations verified:",
      verification.length
    );
    console.log(
      "Destinations still missing images:",
      missingImages.length
    );

    if (missingImages.length > 0) {
      console.log(
        "Missing:",
        missingImages.map((destination) => destination.name)
      );
    }
  } catch (error) {
    console.error("\nImage sync failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
}

syncDestinationImages();
