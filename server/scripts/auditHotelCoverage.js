const attractions = require("../data/attractions");
const hotels = require("../data/hotels");
const calculateDistance = require("../utils/distance");

const SEARCH_RADIUS_KM = 20;

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hasValidCoordinates(item) {
  return (
    Number.isFinite(Number(item?.latitude)) &&
    Number.isFinite(Number(item?.longitude))
  );
}

function main() {
  if (!Array.isArray(attractions) || !Array.isArray(hotels)) {
    throw new Error("Attractions and hotels must both export arrays.");
  }

  const results = attractions.map((attraction) => {
    const destinationHotels = hotels.filter(
      (hotel) =>
        normalize(hotel.destination) === normalize(attraction.destination)
    );

    if (!hasValidCoordinates(attraction)) {
      return {
        attraction,
        destinationHotels,
        nearbyHotels: [],
        issue: "Missing or invalid attraction coordinates"
      };
    }

    const nearbyHotels = destinationHotels
      .filter((hotel) => hasValidCoordinates(hotel.location))
      .map((hotel) => {
        const distance = calculateDistance(
          Number(attraction.latitude),
          Number(attraction.longitude),
          Number(hotel.location.latitude),
          Number(hotel.location.longitude)
        );

        return { hotel, distance: Number(distance.toFixed(2)) };
      })
      .filter((item) => Number.isFinite(item.distance) && item.distance <= SEARCH_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);

    const invalidHotelCoordinates = destinationHotels.some(
      (hotel) => !hasValidCoordinates(hotel.location)
    );

    return {
      attraction,
      destinationHotels,
      nearbyHotels,
      issue: invalidHotelCoordinates
        ? "One or more hotels have missing or invalid coordinates"
        : ""
    };
  });

  const destinations = [...new Set(attractions.map((item) => item.destination))]
    .sort((a, b) => a.localeCompare(b));

  console.log("\n========================================");
  console.log("TRAVEL EXPLORER — HOTEL COVERAGE AUDIT");
  console.log(`Search radius: ${SEARCH_RADIUS_KM} km`);
  console.log(`Attractions checked: ${attractions.length}`);
  console.log(`Hotels in dataset: ${hotels.length}`);
  console.log("========================================\n");

  let covered = 0;
  let uncovered = 0;
  let missingCoordinates = 0;

  for (const destination of destinations) {
    const destinationResults = results.filter(
      (item) => normalize(item.attraction.destination) === normalize(destination)
    );
    const destinationCovered = destinationResults.filter(
      (item) => item.nearbyHotels.length > 0
    ).length;
    const destinationUncovered = destinationResults.length - destinationCovered;

    console.log(`\n${destination}`);
    console.log("-".repeat(destination.length));

    for (const item of destinationResults) {
      const name = item.attraction.name || item.attraction.id || "Unnamed attraction";

      if (item.issue === "Missing or invalid attraction coordinates") {
        missingCoordinates += 1;
        console.log(`  [COORDINATES MISSING] ${name}`);
        continue;
      }

      if (item.nearbyHotels.length > 0) {
        covered += 1;
        const closest = item.nearbyHotels[0];
        console.log(
          `  [COVERED] ${name}: ${item.nearbyHotels.length} hotel(s); closest ${closest.hotel.name} (${closest.distance} km)`
        );
      } else {
        uncovered += 1;
        console.log(
          `  [NO HOTEL WITHIN ${SEARCH_RADIUS_KM} KM] ${name} (${item.destinationHotels.length} hotel(s) in destination dataset)`
        );
      }

      if (item.issue && item.issue !== "Missing or invalid attraction coordinates") {
        console.log(`    [DATA WARNING] ${item.issue}`);
      }
    }

    console.log(
      `  Destination summary: ${destinationCovered}/${destinationResults.length} attractions covered; ${destinationUncovered} without nearby hotels`
    );
  }

  console.log("\n========================================");
  console.log("FINAL SUMMARY");
  console.log("========================================");
  console.log(`Attractions with at least one hotel within ${SEARCH_RADIUS_KM} km: ${covered}`);
  console.log(`Attractions without a nearby hotel: ${uncovered}`);
  console.log(`Attractions missing coordinates: ${missingCoordinates}`);
  console.log(`Total attractions: ${attractions.length}`);
  console.log("\nNote: This checks the coordinates and records in your local files.");
  console.log("It does not verify that a hotel is open, operating, or has live room availability.\n");
}

try {
  main();
} catch (error) {
  console.error("\nHotel coverage audit failed:");
  console.error(error.message);
  process.exitCode = 1;
}
