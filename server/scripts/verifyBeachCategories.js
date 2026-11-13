
const attractions = require("../data/attractions");

const beachIds = [
  "chennai-marina-beach",
  "puri-puri-beach",
  "konark-chandrabhaga-beach",
  "kerala-kovalam-beach",
  "chennai-elliots-beach",
  "puri-swargadwar-beach",
  "puri-balighai-beach",
  "konark-ramachandi-beach",
  "konark-astaranga-beach",
  "mumbai-juhu-beach",
  "rann-of-kutch-mandvi-beach"
];

const failed = [];

for (const id of beachIds) {
  const attraction = attractions.find(item => item.id === id);

  if (
    !attraction ||
    attraction.category !== "beach" ||
    !attraction.tags.includes("beach") ||
    !attraction.tags.includes("coast")
  ) {
    failed.push(id);
  }
}

console.log("Total attractions:", attractions.length);
console.log("Beach records checked:", beachIds.length);
console.log("Failed records:", failed.length);

if (failed.length > 0) {
  console.log("Failed IDs:", failed);
  process.exit(1);
}

console.log("VALIDATION PASSED");
