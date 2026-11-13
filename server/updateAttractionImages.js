
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "data", "attractions.js");

const replacements = {
  "mysuru-chamundi-hill":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Chamundi_temple.JPG?width=1280",

  "pune-shaniwar-wada":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Shaniwar_Wada_Fort_Pune.jpg?width=1280",

  "kolkata-indian-museum":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Building_of_Calcutta_Museum_01.jpg?width=1280",

  "munnar-tea-museum":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Munnar_Tea_Museum_or_Kanan_Devan_Tea_plantation_building_in_Munnar_01.jpg?width=1280"
};

function main() {
  if (!fs.existsSync(filePath)) {
    throw new Error("Could not find server/data/attractions.js");
  }

  const original = fs.readFileSync(filePath, "utf8");

  const prefix = "const attractions = ";
  const exportMarker = "\n\nmodule.exports = attractions;";

  const start = original.indexOf(prefix);
  const end = original.lastIndexOf(exportMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Unexpected attractions.js format. No changes were made."
    );
  }

  const arrayText = original
    .slice(start + prefix.length, end)
    .trim()
    .replace(/;\s*$/, "");

  const attractions = JSON.parse(arrayText);

  const missingIds = Object.keys(replacements).filter(
    (id) => !attractions.some((item) => item.id === id)
  );

  if (missingIds.length > 0) {
    throw new Error(
      `These attraction IDs were not found: ${missingIds.join(", ")}`
    );
  }

  const backupPath =
    filePath + `.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;

  fs.copyFileSync(filePath, backupPath);

  let updated = 0;

  for (const attraction of attractions) {
    const imageUrl = replacements[attraction.id];

    if (imageUrl) {
      attraction.image = imageUrl;
      updated++;

      console.log(`Updated: ${attraction.name}`);
    }
  }

  const newContent =
    `${prefix}${JSON.stringify(attractions, null, 2)};` +
    exportMarker +
    "\n";

  fs.writeFileSync(filePath, newContent, "utf8");

  console.log("\n================================");
  console.log("ATTRACTION IMAGE UPDATE COMPLETE");
  console.log("================================");
  console.log(`Total attractions: ${attractions.length}`);
  console.log(`Images replaced: ${updated}`);
  console.log(`Backup saved: ${backupPath}`);
  console.log("Original attraction data preserved.");
}

try {
  main();
} catch (error) {
  console.error("\nUPDATE FAILED:", error.message);
  process.exit(1);
}
