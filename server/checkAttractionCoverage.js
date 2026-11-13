
const destinations = require("./data/destinations");
const attractions = require("./data/attractions");

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

const report = destinations.map((destination) => {
  const matchingAttractions = attractions.filter(
    (attraction) =>
      normalize(attraction.destination) ===
      normalize(destination.name)
  );

  return {
    destination: destination.name,
    currentCount: matchingAttractions.length,
    targetCount: 10,
    needed: Math.max(0, 10 - matchingAttractions.length),
  };
});

report.sort((a, b) => a.currentCount - b.currentCount);

console.log("\n========== ATTRACTION COVERAGE ==========\n");
console.table(report);

const totalNeeded = report.reduce(
  (sum, item) => sum + item.needed,
  0
);

console.log("\n========== SUMMARY ==========");
console.log("Destinations:", destinations.length);
console.log("Existing attractions:", attractions.length);
console.log("Target attractions per destination: 10");
console.log("Additional attractions needed:", totalNeeded);
console.log("Projected total attractions:", attractions.length + totalNeeded);
