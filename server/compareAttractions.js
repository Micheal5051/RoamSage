const existing = require("./data/attractions");
const additional = require("./data/additionalAttractions");

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

const existingIds = new Set(
  existing.map((item) => normalize(item.id))
);

const existingNames = new Set(
  existing.map(
    (item) =>
      `${normalize(item.destination)}|${normalize(item.name)}`
  )
);

const newAttractions = [];
const duplicateAttractions = [];

for (const item of additional) {
  const id = normalize(item.id);
  const nameKey =
    `${normalize(item.destination)}|${normalize(item.name)}`;

  if (existingIds.has(id) || existingNames.has(nameKey)) {
    duplicateAttractions.push(item);
  } else {
    newAttractions.push(item);
  }
}

console.log("\n===== ATTRACTION COMPARISON =====");
console.log("Existing attractions:", existing.length);
console.log("Additional attractions:", additional.length);
console.log("Genuinely new attractions:", newAttractions.length);
console.log("Duplicates:", duplicateAttractions.length);

console.log("\n===== NEW ATTRACTIONS BY DESTINATION =====");

const counts = {};

for (const item of newAttractions) {
  counts[item.destination] = (counts[item.destination] || 0) + 1;
}

console.table(
  Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([destination, count]) => ({
      destination,
      newAttractions: count,
    }))
);

console.log("\n===== DUPLICATE ATTRACTIONS =====");

console.table(
  duplicateAttractions.map((item) => ({
    id: item.id,
    name: item.name,
    destination: item.destination,
  }))
);