
const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "data", "attractions.js");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function tokens(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function scoreImage(title, attraction, destination) {
  const titleTokens = new Set(tokens(title));
  const attractionTokens = tokens(attraction);
  const destinationTokens = tokens(destination);

  const attractionMatches = attractionTokens.filter((word) =>
    titleTokens.has(word)
  ).length;

  const destinationMatches = destinationTokens.filter((word) =>
    titleTokens.has(word)
  ).length;

  return attractionMatches * 4 + destinationMatches * 2;
}

function getSearchQueries(attraction, destination) {
  const cleanName = attraction.replace(/^the\s+/i, "").trim();

  return [
    `${attraction} ${destination}`,
    `${cleanName} ${destination}`,
    `${attraction} ${destination} India`,
    `${destination} ${cleanName} Wikimedia Commons`,
  ];
}

async function searchCommons(query, attraction, destination) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "1200",
    format: "json",
    origin: "*",
  });

  const url = `https://commons.wikimedia.org/w/api.php?${params}`;

  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TravelExplorerImageUpdater/1.0 (personal project)",
        },
      });

      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const waitTime =
          (Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : 15000 * attempt);

        console.log(`Rate limited. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await delay(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const pages = Object.values(data.query?.pages || {});

      const candidates = pages
        .filter((page) => page.imageinfo?.[0]?.thumburl)
        .map((page) => ({
          title: page.title,
          image: page.imageinfo[0].thumburl,
          score: scoreImage(page.title, attraction, destination),
        }))
        .sort((a, b) => b.score - a.score);

      const bestMatch = candidates.find((item) => item.score >= 4);

      if (bestMatch) {
        return bestMatch;
      }

      return null;
    } catch (error) {
      if (attempt === 4) {
        console.log(`Request failed: ${error.message}`);
        return null;
      }

      const waitTime = 5000 * attempt;
      console.log(`Retrying in ${waitTime / 1000} seconds...`);
      await delay(waitTime);
    }
  }

  return null;
}

async function findImage(attraction, destination) {
  const queries = getSearchQueries(attraction, destination);

  for (const query of queries) {
    console.log(`Searching: ${query}`);

    const result = await searchCommons(
      query,
      attraction,
      destination
    );

    if (result) {
      return result;
    }

    await delay(4000);
  }

  return null;
}

async function main() {
  if (!fs.existsSync(dataFile)) {
    console.error("Could not find server/data/attractions.js");
    process.exit(1);
  }

  delete require.cache[require.resolve(dataFile)];

  const attractions = require(dataFile);

  const missingImages = attractions.filter(
    (item) => !item.image || !item.image.trim()
  );

  const existingImages = attractions.length - missingImages.length;

  console.log("\nTRAVEL EXPLORER - IMAGE RETRY");
  console.log("------------------------------------------");
  console.log(`Total attractions: ${attractions.length}`);
  console.log(`Images already present: ${existingImages}`);
  console.log(`Images remaining: ${missingImages.length}`);

  if (missingImages.length === 0) {
    console.log("\nAll attractions already have images.");
    return;
  }

  const backupFile =
    dataFile +
    `.backup-retry-${new Date().toISOString().replace(/[:.]/g, "-")}`;

  fs.copyFileSync(dataFile, backupFile);
  console.log(`\nBackup created: ${backupFile}\n`);

  let added = 0;
  const notFound = [];

  for (let i = 0; i < missingImages.length; i++) {
    const attraction = missingImages[i];

    console.log(
      `\n[${i + 1}/${missingImages.length}] ${attraction.destination} - ${attraction.name}`
    );

    const result = await findImage(
      attraction.name,
      attraction.destination
    );

    if (result) {
      attraction.image = result.image;
      added++;

      console.log("IMAGE FOUND");
      console.log(`Source: ${result.title}`);
    } else {
      notFound.push(
        `${attraction.destination} - ${attraction.name}`
      );

      console.log("STILL NOT FOUND");
    }

    // Longer pause between attractions to reduce rate limiting.
    await delay(8000);
  }

  const output =
    `const attractions = ${JSON.stringify(attractions, null, 2)};\n\n` +
    `module.exports = attractions;\n`;

  fs.writeFileSync(dataFile, output, "utf8");

  console.log("\n==========================================");
  console.log("IMAGE RETRY FINISHED");
  console.log("==========================================");
  console.log(`New images added: ${added}`);
  console.log(`Images still missing: ${notFound.length}`);
  console.log(`Images already present: ${existingImages}`);
  console.log(`Total attractions: ${attractions.length}`);

  if (notFound.length > 0) {
    console.log("\nRemaining attractions:");

    notFound.forEach((item) => console.log(`- ${item}`));
  }

  console.log("\nUpdated: server/data/attractions.js");
}

main().catch((error) => {
  console.error("Updater failed:", error);
  process.exit(1);
});
