
const existing = require("./data/attractions");
const additional = require("./data/additionalAttractions");

const normalize = (value) =>
  String(value || "").trim().toLowerCase();

const fields = [
  "category",
  "image",
  "description",
  "highlights",
  "latitude",
  "longitude",
  "estimatedVisitMinutes",
  "openingTime",
  "closingTime",
  "closedDays",
  "priority",
  "tags",
];

function hasValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function sameValue(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

const existingMap = new Map();

for (const item of existing) {
  const key =
    `${normalize(item.destination)}|${normalize(item.name)}`;

  existingMap.set(key, item);
}

const stats = {};

for (const field of fields) {
  stats[field] = {
    different: 0,
    existingEmpty: 0,
    additionalEmpty: 0,
    existingHasData: 0,
    additionalHasData: 0,
  };
}

for (const extra of additional) {
  const key =
    `${normalize(extra.destination)}|${normalize(extra.name)}`;

  const original = existingMap.get(key);

  if (!original) continue;

  for (const field of fields) {
    const oldValue = original[field];
    const newValue = extra[field];

    if (!sameValue(oldValue, newValue)) {
      stats[field].different++;
    }

    if (hasValue(oldValue)) {
      stats[field].existingHasData++;
    } else {
      stats[field].existingEmpty++;
    }

    if (hasValue(newValue)) {
      stats[field].additionalHasData++;
    } else {
      stats[field].additionalEmpty++;
    }
  }
}

console.log("\n========== ALL 90 RECORDS FIELD ANALYSIS ==========");

console.table(
  Object.entries(stats).map(([field, values]) => ({
    field,
    different: values.different,
    existingEmpty: values.existingEmpty,
    additionalEmpty: values.additionalEmpty,
    existingHasData: values.existingHasData,
    additionalHasData: values.additionalHasData,
  }))
);

console.log("\nNo files were modified.");
