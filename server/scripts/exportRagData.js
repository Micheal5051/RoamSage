
const fs = require("fs");
const path = require("path");
const {
  isIndianDestinationRecord,
  isIndianAttraction,
  isIndianHotel
} = require("../utils/indiaOnly");

const dataFolder = path.join(__dirname, "..", "data");
const outputFolder = path.join(__dirname, "..", "..", "ai-service");

const sources = [
  {
    file: "destinations.js",
    type: "destination",
    isAllowed: isIndianDestinationRecord
  },
  {
    file: "attractions.js",
    type: "attraction",
    isAllowed: isIndianAttraction
  },
  {
    file: "hotels.js",
    type: "hotel",
    isAllowed: isIndianHotel
  }
];

function loadRecords(fileName) {
  const filePath = path.join(dataFolder, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Required data file not found: ${fileName}`);
  }

  delete require.cache[require.resolve(filePath)];

  const records = require(filePath);

  if (!Array.isArray(records)) {
    throw new Error(`${fileName} must export an array`);
  }

  return records;
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function main() {
  const allRecords = [];
  const seenRecords = new Set();

  for (const source of sources) {
    const records = loadRecords(source.file);

    let added = 0;
    let duplicates = 0;
    let rejected = 0;

    for (const record of records) {
      if (!record || typeof record !== "object" || !source.isAllowed(record)) {
        rejected++;
        continue;
      }

      const name = normalize(record.name);
      const destination = normalize(
        record.destination || record.country
      );

      if (!name) {
        continue;
      }

      const uniqueKey = `${source.type}|${name}|${destination}`;

      if (seenRecords.has(uniqueKey)) {
        duplicates++;
        continue;
      }

      seenRecords.add(uniqueKey);

      allRecords.push({
        ...record,
        ragType: source.type,
        sourceFile: source.file
      });

      added++;
    }

    console.log(
      `${source.file}: ${added} added, ${duplicates} duplicates skipped, ${rejected} non-India/invalid records rejected`
    );
  }

  fs.mkdirSync(outputFolder, { recursive: true });

  const outputPath = path.join(
    outputFolder,
    "knowledge_data.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(allRecords, null, 2),
    "utf8"
  );

  console.log("\nRAG data export completed!");
  console.log("Total unique records:", allRecords.length);
  console.log("Output:", outputPath);
}

try {
  main();
} catch (error) {
  console.error("\nRAG data export failed:", error.message);
  process.exitCode = 1;
}
