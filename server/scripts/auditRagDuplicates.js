
const fs = require("fs");
const path = require("path");
const { isDeepStrictEqual } = require("util");

const dataFolder = path.join(__dirname, "..", "data");
const outputFolder = path.join(__dirname, "..", "..", "ai-service");

const sources = [
  { file: "destinations.js", type: "destination" },
  { file: "attractions.js", type: "attraction" },
  { file: "additionalAttractions.js", type: "attraction" },
  { file: "hotels.js", type: "hotel" },
  { file: "additionalHotels.js", type: "hotel" },
  { file: "additionalVerifiedHotels.js", type: "hotel" }
];

function loadRecords(fileName) {
  const filePath = path.join(dataFolder, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${fileName}`);
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

function getDifferentFields(first, second) {
  const fields = new Set([
    ...Object.keys(first),
    ...Object.keys(second)
  ]);

  const differences = [];

  for (const field of fields) {
    if (!isDeepStrictEqual(first[field], second[field])) {
      differences.push({
        field,
        firstValue: first[field] ?? null,
        duplicateValue: second[field] ?? null
      });
    }
  }

  return differences;
}

function main() {
  const seenRecords = new Map();
  const report = [];

  const summary = {};

  for (const source of sources) {
    const records = loadRecords(source.file);

    let exactDuplicates = 0;
    let differentDuplicates = 0;
    let uniqueRecords = 0;

    for (const record of records) {
      if (!record || typeof record !== "object") {
        continue;
      }

      const name = normalize(record.name);
      const destination = normalize(
        record.destination || record.country
      );

      if (!name) continue;

      const key = `${source.type}|${name}|${destination}`;

      if (!seenRecords.has(key)) {
        seenRecords.set(key, {
          record,
          sourceFile: source.file
        });

        uniqueRecords++;
        continue;
      }

      const original = seenRecords.get(key);

      const differences = getDifferentFields(
        original.record,
        record
      );

      const isExactDuplicate = differences.length === 0;

      if (isExactDuplicate) {
        exactDuplicates++;
      } else {
        differentDuplicates++;
      }

      report.push({
        type: source.type,
        name: record.name,
        destination: record.destination || record.country || null,
        firstSource: original.sourceFile,
        duplicateSource: source.file,
        duplicateType: isExactDuplicate
          ? "EXACT_DUPLICATE"
          : "DIFFERENT_INFORMATION",
        differentFields: differences
      });
    }

    summary[source.file] = {
      totalRecords: records.length,
      uniqueRecords,
      exactDuplicates,
      differentDuplicates
    };

    console.log(
      `${source.file}: ${uniqueRecords} unique, ` +
      `${exactDuplicates} exact duplicates, ` +
      `${differentDuplicates} with different information`
    );
  }

  fs.mkdirSync(outputFolder, { recursive: true });

  const outputPath = path.join(
    outputFolder,
    "rag_duplicate_report.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify({ summary, duplicates: report }, null, 2),
    "utf8"
  );

  console.log("\nDuplicate audit completed!");
  console.log("Total duplicate records:", report.length);
  console.log("Report saved to:", outputPath);
}

try {
  main();
} catch (error) {
  console.error("\nAudit failed:", error.message);
  process.exitCode = 1;
}
