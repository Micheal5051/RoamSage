const fs = require("fs");
const path = require("path");

const dataDirectory = path.resolve(__dirname, "../data");
const hotelsPath = path.join(dataDirectory, "hotels.js");
const additionalPath = path.join(dataDirectory, "additionalHotels.js");

if (!fs.existsSync(hotelsPath) || !fs.existsSync(additionalPath)) {
  console.error("Missing server/data/hotels.js or server/data/additionalHotels.js");
  process.exit(1);
}

const existingHotels = require(hotelsPath);
const additionalHotels = require(additionalPath);
const { isIndianHotel } = require("../utils/indiaOnly");

if (!Array.isArray(existingHotels) || !Array.isArray(additionalHotels)) {
  console.error("Hotel files must both export arrays.");
  process.exit(1);
}

const ids = new Set(existingHotels.map((hotel) => hotel.id));
const names = new Set(existingHotels.map((hotel) =>
  `${String(hotel.name || "").trim().toLowerCase()}|${String(hotel.destination || "").trim().toLowerCase()}`
));
const additionsToMerge = [];
let duplicatesSkipped = 0;

for (const hotel of additionalHotels) {
  const nameKey = `${String(hotel.name || "").trim().toLowerCase()}|${String(hotel.destination || "").trim().toLowerCase()}`;
  if (ids.has(hotel.id) || names.has(nameKey)) {
    duplicatesSkipped += 1;
    continue;
  }
  if (!isIndianHotel(hotel)) {
    console.error(`Rejected non-India or incomplete hotel record: ${hotel.name || hotel.id || "unknown"}`);
    process.exit(1);
  }
  if (!hotel.id || !hotel.name || !hotel.destination ||
      !Number.isFinite(hotel.location?.latitude) ||
      !Number.isFinite(hotel.location?.longitude)) {
    console.error(`Invalid hotel record: ${hotel.name || hotel.id || "unknown"}`);
    process.exit(1);
  }
  additionsToMerge.push(hotel);
  ids.add(hotel.id);
  names.add(nameKey);
}

const mergedHotels = [...existingHotels, ...additionsToMerge];
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `${hotelsPath}.backup-${timestamp}`;

fs.copyFileSync(hotelsPath, backupPath);
fs.writeFileSync(
  hotelsPath,
  `const hotels = ${JSON.stringify(mergedHotels, null, 2)};\n\nmodule.exports = hotels;\n`,
  "utf8"
);

console.log("Existing hotels preserved:", existingHotels.length);
console.log("New hotels added:", additionsToMerge.length);
console.log("Duplicates skipped:", duplicatesSkipped);
console.log("Total hotels:", mergedHotels.length);
console.log("Destinations with added hotels:", new Set(additionsToMerge.map((hotel) => hotel.destination)).size);
console.log("Backup:", backupPath);
