
const fs = require("fs");
const path = require("path");

const attractionsPath = path.join(__dirname, "../data/attractions.js");

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

function findMatchingBrace(source, start) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let i = start; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === quote) quote = null;
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      i++;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      i++;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "{") depth++;

    if (char === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }

  throw new Error("Could not find the end of an attraction object.");
}

function updateBeachRecord(source, id) {
  const idPattern = new RegExp(
    `(["']id["']\\s*:\\s*["'])${id}(["'])`
  );

  const match = idPattern.exec(source);

  if (!match) {
    throw new Error(`Attraction not found: ${id}`);
  }

  const idPosition = match.index;
  const objectStart = source.lastIndexOf("{", idPosition);

  if (objectStart === -1) {
    throw new Error(`Could not locate object for: ${id}`);
  }

  const objectEnd = findMatchingBrace(source, objectStart);
  let record = source.slice(objectStart, objectEnd + 1);

  const categoryPattern =
    /((?:["']category["']|category)\s*:\s*)(["'])[^"']*\2/;

  if (!categoryPattern.test(record)) {
    throw new Error(`Category field not found for: ${id}`);
  }

  record = record.replace(categoryPattern, '$1"beach"');

  const tagsPattern =
    /((?:["']tags["']|tags)\s*:\s*)\[([\s\S]*?)\]/;

  const tagsMatch = tagsPattern.exec(record);

  if (!tagsMatch) {
    throw new Error(`Tags array not found for: ${id}`);
  }

  const tagsText = tagsMatch[2];
  const tagsToAdd = [];

  if (!/["']beach["']/.test(tagsText)) {
    tagsToAdd.push('"beach"');
  }

  if (!/["']coast["']/.test(tagsText)) {
    tagsToAdd.push('"coast"');
  }

  if (tagsToAdd.length > 0) {
    const trimmedTags = tagsText.trim();
    const updatedTags = trimmedTags
      ? `${trimmedTags}, ${tagsToAdd.join(", ")}`
      : tagsToAdd.join(", ");

    record = record.replace(
      tagsPattern,
      `$1[${updatedTags}]`
    );
  }

  return (
    source.slice(0, objectStart) +
    record +
    source.slice(objectEnd + 1)
  );
}

function main() {
  let source = fs.readFileSync(attractionsPath, "utf8");

  // Check that every target ID occurs exactly once.
  for (const id of beachIds) {
    const occurrences = source.match(
      new RegExp(`(["']id["']\\s*:\\s*["'])${id}(["'])`, "g")
    ) || [];

    if (occurrences.length !== 1) {
      throw new Error(
        `${id} occurs ${occurrences.length} times. Expected exactly once.`
      );
    }
  }

  // Create a backup before modifying the original file.
  const backupPath =
    `${attractionsPath}.backup-beach-${Date.now()}`;

  fs.copyFileSync(attractionsPath, backupPath);

  try {
    for (const id of beachIds) {
      source = updateBeachRecord(source, id);
    }

    // Validate the updated JavaScript before saving it.
    const validationModule = { exports: {} };
    new Function("module", "exports", source)(
      validationModule,
      validationModule.exports
    );

    const updatedAttractions = validationModule.exports;

    if (!Array.isArray(updatedAttractions)) {
      throw new Error("The attractions module did not export an array.");
    }

    for (const id of beachIds) {
      const attraction = updatedAttractions.find(
        item => item.id === id
      );

      if (
        !attraction ||
        attraction.category !== "beach" ||
        !attraction.tags.includes("beach") ||
        !attraction.tags.includes("coast")
      ) {
        throw new Error(`Validation failed for ${id}`);
      }
    }

    fs.writeFileSync(attractionsPath, source, "utf8");

    console.log("\nBeach category update successful!");
    console.log(`Updated records: ${beachIds.length}`);
    console.log(`Total attractions: ${updatedAttractions.length}`);
    console.log(`Backup created: ${backupPath}`);

    console.log("\nUpdated beaches:");

    for (const id of beachIds) {
      const attraction = updatedAttractions.find(
        item => item.id === id
      );

      console.log(
        `- ${attraction.name}: ${attraction.category}`
      );
    }
  } catch (error) {
    fs.copyFileSync(backupPath, attractionsPath);
    console.error("\nUpdate failed. Original file restored.");
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
