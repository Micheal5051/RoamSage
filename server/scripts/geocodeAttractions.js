
/**
 * Enrich missing attraction coordinates using OpenStreetMap Nominatim.
 *
 * Run from the project root:
 * node server/scripts/geocodeAttractions.js
 *
 * Safety:
 * - Only accepts results confirmed to be in India.
 * - Uses destination and state as search context.
 * - Checks attraction-specific name matches.
 * - Retries temporary HTTP errors.
 * - Leaves uncertain locations unresolved.
 * - Synchronizes duplicate attraction IDs across both data files.
 * - Creates backups before modifying either file.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const MAIN_FILE = path.join(DATA_DIR, "attractions.js");
const ADDITIONAL_FILE = path.join(DATA_DIR, "additionalAttractions.js");

const MIN_REQUEST_INTERVAL = 1100;
const MAX_RETRIES = 3;

const DESTINATION_STATE = {
  Hyderabad: "Telangana",
  Goa: "Goa",
  Kashmir: "Jammu and Kashmir",
  Ladakh: "Ladakh",
  Manali: "Himachal Pradesh",
  Shimla: "Himachal Pradesh",
  Jaipur: "Rajasthan",
  Agra: "Uttar Pradesh",
  Delhi: "Delhi",
  Varanasi: "Uttar Pradesh",
  Kerala: "Kerala",
  Munnar: "Kerala",
  Ooty: "Tamil Nadu",
  Mysuru: "Karnataka",
  Hampi: "Karnataka",
  Chennai: "Tamil Nadu",
  Coorg: "Karnataka",
  Kolkata: "West Bengal",
  Darjeeling: "West Bengal",
  Puri: "Odisha",
  Bhubaneswar: "Odisha",
  Konark: "Odisha",
  Sundarbans: "West Bengal",
  "Bodh Gaya": "Bihar",
  Ranchi: "Jharkhand",
  Mumbai: "Maharashtra",
  Udaipur: "Rajasthan",
  Jaisalmer: "Rajasthan",
  Ahmedabad: "Gujarat",
  "Rann of Kutch": "Gujarat",
  Pune: "Maharashtra",
  Lonavala: "Maharashtra"
};

const STATE_ALIASES = {
  "Jammu and Kashmir": [
    "Jammu and Kashmir",
    "Jammu & Kashmir",
    "Jammu Kashmir"
  ],
  Ladakh: ["Ladakh"],
  Delhi: ["Delhi", "National Capital Territory of Delhi"]
};

const GENERIC_WORDS = new Set([
  "the", "of", "and", "in", "at", "near",
  "temple", "beach", "lake", "fort", "park",
  "garden", "falls", "fall", "waterfall",
  "museum", "palace", "hill", "viewpoint",
  "sanctuary", "monastery", "road", "stupa",
  "ghat", "cave", "caves", "zoo", "cathedral",
  "church", "mosque", "dargah", "dam",
  "island", "point", "valley", "complex",
  "national", "state", "wildlife", "reserve",
  "heritage", "centre", "center", "india"
]);

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

const normalize = value =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function tokens(value) {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean);
}

function loadArray(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing file: ${file}`);
  }

  delete require.cache[require.resolve(file)];

  const value = require(file);

  if (!Array.isArray(value)) {
    throw new Error(
      `${path.basename(file)} must export an array`
    );
  }

  return value;
}

function backup(file) {
  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const target = `${file}.backup-${stamp}`;

  fs.copyFileSync(file, target);

  return target;
}

let lastRequestTime = 0;

async function waitForRequestSlot() {
  const elapsed = Date.now() - lastRequestTime;
  const remaining = MIN_REQUEST_INTERVAL - elapsed;

  if (remaining > 0) {
    await sleep(remaining);
  }

  lastRequestTime = Date.now();
}

function getStateAliases(expectedState) {
  return STATE_ALIASES[expectedState] || [expectedState];
}

function stateMatches(expectedState, candidate) {
  const aliases = getStateAliases(expectedState)
    .map(normalize);

  const address = candidate.address || {};

  const candidateStates = [
    address.state,
    address.state_district,
    address.region
  ]
    .filter(Boolean)
    .map(normalize);

  const display = normalize(candidate.display_name || "");

  return aliases.some(alias =>
    candidateStates.some(state =>
      state === alias || state.includes(alias) || alias.includes(state)
    ) || display.includes(alias)
  );
}

function hasIndiaAddress(candidate) {
  const address = candidate.address || {};

  return (
    String(candidate.country_code || "").toLowerCase() === "in" ||
    normalize(address.country) === "india"
  );
}

function getDistinctiveTokens(name, destination, state) {
  const excluded = new Set([
    ...tokens(destination),
    ...tokens(state),
    ...GENERIC_WORDS
  ]);

  return tokens(name).filter(token =>
    token.length > 2 && !excluded.has(token)
  );
}

function scoreCandidate(attraction, candidate, expectedState) {
  const name = normalize(attraction.name);

  const candidateName = normalize(candidate.name || "");
  const displayName = normalize(candidate.display_name || "");

  const combined = `${candidateName} ${displayName}`;

  const targetTokens = getDistinctiveTokens(
    attraction.name,
    attraction.destination,
    expectedState
  );

  const matchedTokens = targetTokens.filter(token =>
    tokens(combined).includes(token)
  );

  const exactPhrase =
    candidateName === name ||
    candidateName.includes(name) ||
    displayName.includes(name);

  const stateMatch = stateMatches(expectedState, candidate);

  if (targetTokens.length > 0) {
    const coverage = matchedTokens.length / targetTokens.length;

    if (matchedTokens.length === 0 || coverage < 0.5) {
      return null;
    }

    return (
      coverage * 70 +
      (exactPhrase ? 25 : 0) +
      (stateMatch ? 5 : 0)
    );
  }

  // For generic names such as "Mall Road", require a strong
  // phrase match and matching destination/state context.
  if (!exactPhrase || !stateMatch) {
    return null;
  }

  return 100;
}

function buildQueries(attraction, state) {
  const name = attraction.name;
  const destination = attraction.destination;

  return [
    `${name}, ${destination}, ${state}, India`,
    `${name}, ${state}, India`
  ];
}

async function requestNominatim(query) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "in",
    limit: "5"
  });

  const url =
    `https://nominatim.openstreetmap.org/search?${params}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    await waitForRequestSlot();

    let response;

    try {
      response = await fetch(url, {
        headers: {
          "User-Agent": "TravelExplorerCoordinateEnrichment/2.0",
          "Accept-Language": "en"
        }
      });
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        throw new Error(`Network error: ${error.message}`);
      }

      await sleep(attempt * 5000);
      continue;
    }

    if (response.ok) {
      return await response.json();
    }

    const retryable = [
      429, 500, 502, 503, 504
    ].includes(response.status);

    if (!retryable || attempt === MAX_RETRIES) {
      throw new Error(`Nominatim HTTP ${response.status}`);
    }

    const retryAfter = Number(
      response.headers.get("retry-after")
    );

    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : attempt * 10000;

    console.log(
      `RETRY  HTTP ${response.status}; waiting ${delay / 1000}s`
    );

    await sleep(delay);
  }

  return [];
}

async function geocode(attraction) {
  const state = DESTINATION_STATE[attraction.destination];

  if (!state) {
    return {
      status: "unresolved",
      reason: "No state mapping"
    };
  }

  const queries = buildQueries(attraction, state);

  let allCandidates = [];

  for (const query of queries) {
    const results = await requestNominatim(query);

    const valid = results
      .filter(hasIndiaAddress)
      .map(item => ({
        item,
        score: scoreCandidate(attraction, item, state)
      }))
      .filter(entry => entry.score !== null)
      .sort((a, b) => b.score - a.score);

    allCandidates.push(...valid);

    if (valid.length > 0) {
      break;
    }
  }

  if (allCandidates.length === 0) {
    return {
      status: "unresolved",
      reason: "No confident India/name match"
    };
  }

  allCandidates.sort((a, b) => b.score - a.score);

  const best = allCandidates[0];

  if (
    allCandidates.length > 1 &&
    Math.abs(best.score - allCandidates[1].score) < 0.01
  ) {
    const first = best.item;
    const second = allCandidates[1].item;

    // Different coordinates with the same score are ambiguous.
    if (
      first.lat !== second.lat ||
      first.lon !== second.lon
    ) {
      return {
        status: "unresolved",
        reason: "Ambiguous matching results"
      };
    }
  }

  const latitude = Number(best.item.lat);
  const longitude = Number(best.item.lon);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < 6 ||
    latitude > 38 ||
    longitude < 68 ||
    longitude > 98
  ) {
    return {
      status: "unresolved",
      reason: "Coordinates outside India or invalid"
    };
  }

  return {
    status: "matched",
    latitude,
    longitude,
    matchedName:
      best.item.name || best.item.display_name,
    displayName: best.item.display_name,
    confidenceScore: best.score
  };
}

function saveArray(file, variableName, items, header = "") {
  const contents =
    `${header ? `${header}\n` : ""}` +
    `const ${variableName} = ${JSON.stringify(items, null, 2)};\n\n` +
    `module.exports = ${variableName};\n`;

  fs.writeFileSync(file, contents, "utf8");
}

async function main() {
  if (typeof fetch !== "function") {
    throw new Error(
      "Node.js 18 or newer is required."
    );
  }

  const mainItems = loadArray(MAIN_FILE);

  const additionalItems = fs.existsSync(ADDITIONAL_FILE)
    ? loadArray(ADDITIONAL_FILE)
    : [];

  const allItems = [...mainItems, ...additionalItems];

  const byId = new Map();

  for (const item of allItems) {
    if (!item.id) continue;

    const existing = byId.get(item.id);

    const hasCoordinates =
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude);

    const existingHasCoordinates = existing &&
      Number.isFinite(existing.latitude) &&
      Number.isFinite(existing.longitude);

    if (!existing || (hasCoordinates && !existingHasCoordinates)) {
      byId.set(item.id, item);
    }
  }

  const known = new Map();

  for (const item of allItems) {
    if (
      item.id &&
      Number.isFinite(item.latitude) &&
      Number.isFinite(item.longitude)
    ) {
      known.set(item.id, {
        latitude: item.latitude,
        longitude: item.longitude
      });
    }
  }

  const pending = [...byId.values()].filter(item =>
    !known.has(item.id)
  );

  console.log("\nTRAVEL EXPLORER COORDINATE ENRICHMENT");
  console.log("-------------------------------------");
  console.log(`Unique attraction records: ${byId.size}`);
  console.log(`Already have coordinates: ${known.size}`);
  console.log(`Need geocoding: ${pending.length}`);
  console.log("Provider: OpenStreetMap Nominatim");
  console.log("Request interval: at least 1.1 seconds");
  console.log("-------------------------------------\n");

  const matches = new Map();
  const unresolved = [];

  let requestCount = 0;

  for (let index = 0; index < pending.length; index++) {
    const item = pending[index];

    console.log(
      `[${index + 1}/${pending.length}] ${item.destination}: ${item.name}`
    );

    try {
      const result = await geocode(item);

      if (result.status === "matched") {
        matches.set(item.id, {
          latitude: result.latitude,
          longitude: result.longitude
        });

        console.log(
          `MATCH  ${result.latitude}, ${result.longitude}`
        );

        console.log(
          `       ${result.matchedName}`
        );
      } else {
        unresolved.push({
          id: item.id,
          name: item.name,
          destination: item.destination,
          reason: result.reason
        });

        console.log(`SKIP   ${result.reason}`);
      }
    } catch (error) {
      unresolved.push({
        id: item.id,
        name: item.name,
        destination: item.destination,
        reason: error.message
      });

      console.log(`ERROR  ${error.message}`);
    }

    requestCount++;
  }

  const coordinates = new Map([
    ...known,
    ...matches
  ]);

  const applyCoordinates = items =>
    items.map(item => {
      const point = coordinates.get(item.id);

      if (!point) return item;

      return {
        ...item,
        latitude: point.latitude,
        longitude: point.longitude
      };
    });

  // Back up both files before writing any changes.
  const mainBackup = backup(MAIN_FILE);

  const additionalBackup = additionalItems.length
    ? backup(ADDITIONAL_FILE)
    : null;

  saveArray(
    MAIN_FILE,
    "attractions",
    applyCoordinates(mainItems)
  );

  if (additionalItems.length) {
    saveArray(
      ADDITIONAL_FILE,
      "additionalAttractions",
      applyCoordinates(additionalItems),
      "// Additional attraction records. Coordinates are synchronized by id with attractions.js where available."
    );
  }

  const report = {
    generatedAt: new Date().toISOString(),
    provider: "OpenStreetMap Nominatim",
    requestCount,
    matchedThisRun: matches.size,
    alreadyKnown: known.size,
    unresolved,
    backups: [
      mainBackup,
      additionalBackup
    ].filter(Boolean)
  };

  const reportFile = path.join(
    DATA_DIR,
    "coordinate-geocoding-report.json"
  );

  fs.writeFileSync(
    reportFile,
    JSON.stringify(report, null, 2)
  );

  const updatedMain = applyCoordinates(mainItems);

  const remaining = updatedMain.filter(item =>
    !Number.isFinite(item.latitude) ||
    !Number.isFinite(item.longitude)
  );

  console.log("\n-------------------------------------");
  console.log("GEOCODING FINISHED");
  console.log("-------------------------------------");
  console.log(`New coordinates: ${matches.size}`);
  console.log(`Previously known: ${known.size}`);
  console.log(
    `Still unresolved in main catalogue: ${remaining.length}/${mainItems.length}`
  );
  console.log(`Report: ${reportFile}`);
  console.log(`Backup: ${mainBackup}`);

  if (additionalBackup) {
    console.log(`Backup: ${additionalBackup}`);
  }

  console.log(
    "Uncertain locations were left without coordinates."
  );
}

main().catch(error => {
  console.error("\nCoordinate enrichment failed:", error);
  process.exitCode = 1;
});
