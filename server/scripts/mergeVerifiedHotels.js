const fs = require("fs");
const path = require("path");

const hotelsPath = path.join(__dirname, "../data/hotels.js");
const additionsPath = path.join(__dirname, "../data/additionalVerifiedHotels.js");
const { isIndianHotel } = require("../utils/indiaOnly");

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function main() {
  if (!fs.existsSync(hotelsPath)) throw new Error("Could not find server/data/hotels.js");
  if (!fs.existsSync(additionsPath)) throw new Error("Could not find server/data/additionalVerifiedHotels.js");

  const existingHotels = require(hotelsPath);
  const additions = require(additionsPath);

  if (!Array.isArray(existingHotels) || !Array.isArray(additions)) {
    throw new Error("Both hotel files must export arrays.");
  }

  const knownIds = new Set(existingHotels.map((hotel) => hotel.id));
  const knownNames = new Set(
    existingHotels.map((hotel) => `${normalize(hotel.name)}|${normalize(hotel.destination)}`)
  );

  const newHotels = [];
  let duplicatesSkipped = 0;

  for (const hotel of additions) {
    const nameKey = `${normalize(hotel.name)}|${normalize(hotel.destination)}`;

    if (knownIds.has(hotel.id) || knownNames.has(nameKey)) {
      duplicatesSkipped += 1;
      continue;
    }

    if (!isIndianHotel(hotel)) {
      throw new Error(`Rejected non-India or incomplete hotel record: ${hotel.name || hotel.id || "unknown"}`);
    }

    newHotels.push(hotel);
    knownIds.add(hotel.id);
    knownNames.add(nameKey);
  }

  if (newHotels.length === 0) {
    console.log("No new hotels to add. Existing data was not changed.");
    console.log(`Duplicates skipped: ${duplicatesSkipped}`);
    return;
  }

  const backupPath = `${hotelsPath}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  fs.copyFileSync(hotelsPath, backupPath);

  const mergedHotels = [...existingHotels, ...newHotels];
  const output = `const hotels = ${JSON.stringify(mergedHotels, null, 2)};\n\nmodule.exports = hotels;\n`;

  fs.writeFileSync(hotelsPath, output, "utf8");

  console.log("Verified hotel merge completed.");
  console.log(`Existing hotels preserved: ${existingHotels.length}`);
  console.log(`New hotels added: ${newHotels.length}`);
  console.log(`Duplicates skipped: ${duplicatesSkipped}`);
  console.log(`Total hotels: ${mergedHotels.length}`);
  console.log(`Backup: ${backupPath}`);
}

try {
  main();
} catch (error) {
  console.error("Hotel merge failed:", error.message);
  process.exitCode = 1;
}
