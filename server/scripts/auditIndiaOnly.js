const assert = require("node:assert/strict");

const destinations = require("../data/destinations");
const attractions = require("../data/attractions");
const hotels = require("../data/hotels");
const additionalHotels = require("../data/additionalHotels");
const additionalVerifiedHotels = require("../data/additionalVerifiedHotels");
const {
  getIndianDestination,
  isIndianDestinationRecord,
  isIndianAttraction,
  isIndianHotel,
  isWithinIndiaBounds,
  isGeoapifyIndiaFeature,
  isGeoapifyFoodFeature
} = require("../utils/indiaOnly");

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = [];
  for (const value of values) {
    if (seen.has(value)) duplicates.push(value);
    seen.add(value);
  }
  return duplicates;
}

function summarize(name, records, predicate) {
  const invalid = records.filter((record) => !predicate(record));
  console.log(`${name}: ${records.length - invalid.length}/${records.length} passed`);
  if (invalid.length) {
    invalid.forEach((record) =>
      console.error(`  INVALID: ${record.name || record.id || "unnamed record"}`)
    );
  }
  return invalid;
}

function main() {
  const failures = [];
  const duplicateDestinationNames = findDuplicates(
    destinations.map((item) => String(item.name).trim().toLowerCase())
  );
  const duplicateHotelIds = findDuplicates(hotels.map((item) => item.id));
  const missingGoa = !getIndianDestination("Goa");

  console.log("INDIA-ONLY CATALOGUE AUDIT");
  console.log("--------------------------");
  console.log(`Destinations in catalogue: ${destinations.length}`);
  console.log(`Attractions in catalogue: ${attractions.length}`);
  console.log(`Active hotels: ${hotels.length}`);
  console.log(`Additional hotels awaiting merge: ${additionalHotels.length}`);
  console.log(`Additional verified hotels awaiting merge: ${additionalVerifiedHotels.length}`);

  if (duplicateDestinationNames.length) {
    failures.push(`Duplicate destination names: ${duplicateDestinationNames.join(", ")}`);
  }
  if (duplicateHotelIds.length) {
    failures.push(`Duplicate active hotel IDs: ${duplicateHotelIds.join(", ")}`);
  }
  if (missingGoa) failures.push("Goa is missing from the destination catalogue.");

  failures.push(...summarize(
    "Destination records",
    destinations,
    (record) => isIndianDestinationRecord(record)
  ).map((record) => `Invalid destination: ${record.name}`));

  failures.push(...summarize(
    "Active hotels",
    hotels,
    isIndianHotel
  ).map((record) => `Invalid active hotel: ${record.name}`));

  failures.push(...summarize(
    "Additional hotels",
    additionalHotels,
    isIndianHotel
  ).map((record) => `Invalid additional hotel: ${record.name}`));

  failures.push(...summarize(
    "Additional verified hotels",
    additionalVerifiedHotels,
    isIndianHotel
  ).map((record) => `Invalid verified hotel: ${record.name}`));

  const invalidAttractions = attractions.filter((record) => !isIndianAttraction(record));
  console.log(`Attractions tied to supported Indian destinations: ${attractions.length - invalidAttractions.length}/${attractions.length}`);
  if (invalidAttractions.length) {
    invalidAttractions.forEach((record) =>
      console.error(`  INVALID ATTRACTION: ${record.name} (${record.destination || "no destination"})`)
    );
    failures.push(...invalidAttractions.map((record) => `Invalid attraction: ${record.name}`));
  }

  const foreignHotelProbe = {
    ...hotels[0],
    id: "audit-foreign-hotel",
    destination: "Lahore",
    address: "Mall Road, Lahore, Punjab",
    location: { latitude: 31.5204, longitude: 74.3587 }
  };
  const foreignDestinationProbe = {
    ...destinations[0],
    name: "Islamabad",
    country: "Pakistan",
    latitude: 33.6844,
    longitude: 73.0479
  };

  assert.equal(isIndianHotel(foreignHotelProbe), false, "Foreign hotel probe must be rejected");
  const hotelWithoutCountryCode = { ...hotels[0], id: "audit-missing-country-code" };
  delete hotelWithoutCountryCode.countryCode;
  assert.equal(isIndianHotel(hotelWithoutCountryCode), false, "Hotel without explicit India country code must be rejected");
  assert.equal(isIndianDestinationRecord(foreignDestinationProbe), false, "Foreign destination probe must be rejected");
  assert.equal(getIndianDestination("Islamabad"), null, "Foreign destination must not resolve from the catalogue");
  assert.equal(isGeoapifyIndiaFeature({ country: "Pakistan", country_code: "pk" }), false, "Pakistan Geoapify result must be rejected");
  assert.equal(isGeoapifyIndiaFeature({ country: "India", country_code: "in" }), true, "India Geoapify result must be accepted");
  assert.equal(isGeoapifyFoodFeature({ categories: ["accommodation.hotel"] }), false, "Accommodation must not appear in food results");
  assert.equal(isGeoapifyFoodFeature({ categories: ["catering.restaurant"] }), true, "Restaurant category must be accepted");
  assert.equal(isWithinIndiaBounds(31.5204, 74.3587), true, "Coordinate bounds alone include some border-neighbour locations; country verification is also required");
  console.log("Foreign-result regression probes: 10/10 passed");

  if (failures.length) {
    console.error("\nAUDIT FAILED:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
    return;
  }

  console.log("\nAUDIT PASSED: the active local data matches the supported India-only catalogue.");
}

main();
