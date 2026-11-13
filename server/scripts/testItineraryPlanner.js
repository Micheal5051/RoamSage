const attractions = require("../data/attractions");
const { generateItinerary } = require("../utils/itineraryGenerator");

const destinations = [...new Set(attractions.map(item => item.destination).filter(Boolean))];
const startDate = "2026-11-12";
const endDate = "2026-11-14";
const failures = [];

function toMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return null;
  let hours = Number(match[1]);
  if (match[3] === "AM" && hours === 12) hours = 0;
  if (match[3] === "PM" && hours !== 12) hours += 12;
  return hours * 60 + Number(match[2]);
}

for (const destination of destinations) {
  const validPlaces = attractions.filter(item =>
    item.destination === destination &&
    item.id &&
    item.name &&
    Number.isFinite(Number(item.estimatedVisitMinutes)) &&
    Number(item.estimatedVisitMinutes) > 0
  );

  try {
    const result = generateItinerary({
      destination,
      startDate,
      endDate,
      interests: ["history", "architecture", "nature"],
      selectedAttractionIds: validPlaces.map(item => String(item.id))
    });

    if (result.days.length !== 3) {
      failures.push(`${destination}: expected 3 calendar days, got ${result.days.length}`);
    }

    const seen = new Set();
    for (const day of result.days) {
      const timedEvents = day.schedule.filter(event =>
        event.startTime && event.endTime && Number(event.durationMinutes) > 0
      );

      for (let index = 1; index < timedEvents.length; index += 1) {
        const previousEnd = toMinutes(timedEvents[index - 1].endTime);
        const currentStart = toMinutes(timedEvents[index].startTime);
        if (previousEnd !== null && currentStart !== null && currentStart < previousEnd) {
          failures.push(`${destination} ${day.date}: overlapping events`);
        }
      }

      const dayAttractions = day.schedule.filter(event => event.type === "attraction");
      for (const place of dayAttractions) {
        if (seen.has(place.id)) failures.push(`${destination}: duplicate attraction ${place.name}`);
        seen.add(place.id);
      }

      if (dayAttractions.length > 0 && day.schedule.filter(event => event.type === "break").length !== 1) {
        failures.push(`${destination} ${day.date}: expected one lunch break`);
      }
    }

    if (result.scheduledAttractionCount + result.unplannedAttractions.length !== validPlaces.length) {
      failures.push(`${destination}: selected/scheduled/unplanned count mismatch`);
    }
  } catch (error) {
    failures.push(`${destination}: ${error.message}`);
  }
}

if (failures.length) {
  console.error("Itinerary planner checks failed:");
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`Passed: ${destinations.length} destinations, 3-day schedules, no duplicate attractions, no overlapping timed events, and lunch-break checks.`);
}

const hyderabad = generateItinerary({
  destination: "Hyderabad",
  startDate,
  endDate,
  interests: ["history", "architecture"],
  selectedAttractionIds: attractions
    .filter(item => item.destination === "Hyderabad" && item.id && Number(item.estimatedVisitMinutes) > 0)
    .map(item => String(item.id))
});
const relaxedHyderabad = generateItinerary({
  destination: "Hyderabad",
  startDate: "2026-11-12",
  endDate: "2026-11-18",
  interests: ["history", "architecture"],
  selectedAttractionIds: attractions
    .filter(item => item.destination === "Hyderabad" && item.id && Number(item.estimatedVisitMinutes) > 0)
    .map(item => String(item.id))
});
if (relaxedHyderabad.days.length !== 7) {
  console.error("7-day Hyderabad check failed: expected 7 calendar days.");
  process.exitCode = 1;
}
if (relaxedHyderabad.scheduledAttractionCount > 0 && relaxedHyderabad.recommendedDays < 2) {
  console.error("7-day Hyderabad check failed: attractions were not distributed across multiple days.");
  process.exitCode = 1;
}
console.log("7-day Hyderabad relaxed schedule:");
relaxedHyderabad.days.forEach(day => {
  const names = day.schedule.filter(event => event.type === "attraction").map(event => event.title);
  console.log(`- ${day.date}: ${day.attractionCount} attractions — ${names.join(", ")}`);
});
console.log(relaxedHyderabad.tripDurationMessage);

console.log("Hyderabad sample:");
hyderabad.days.forEach(day => {
  const names = day.schedule.filter(event => event.type === "attraction").map(event => event.title);
  console.log(`- ${day.date}: ${day.attractionCount} attractions — ${names.join(", ")}`);
});


for (const tripDays of [5, 7, 12]) {
  const tripEnd = new Date(Date.parse(`${startDate}T00:00:00Z`) + (tripDays - 1) * 86400000).toISOString().slice(0, 10);
  try {
    const result = generateItinerary({
      destination: "Hyderabad",
      startDate,
      endDate: tripEnd,
      interests: ["history", "architecture"],
      selectedAttractionIds: attractions
        .filter(item => item.destination === "Hyderabad" && item.id && Number(item.estimatedVisitMinutes) > 0)
        .map(item => String(item.id))
    });
    const expectedFlexible = tripDays >= 10 ? 3 : 2;
    const flexible = result.days.filter(day => day.isFlexibleDay).length;
    if (result.days.length !== tripDays) failures.push(`${tripDays}-day check: expected ${tripDays} calendar days, got ${result.days.length}`);
    if (flexible < expectedFlexible) failures.push(`${tripDays}-day check: expected at least ${expectedFlexible} flexible days, got ${flexible}`);
    if (result.days.slice(-expectedFlexible).some(day => day.attractionCount !== 0)) failures.push(`${tripDays}-day check: reserved flexible days contain sightseeing attractions`);
    console.log(`${tripDays}-day Hyderabad check: ${result.recommendedDays} sightseeing days, ${flexible} flexible days, ${result.scheduledAttractionCount} attractions scheduled.`);
  } catch (error) {
    failures.push(`${tripDays}-day check: ${error.message}`);
  }
}

if (failures.length) {
  console.error("Additional relaxed-trip checks failed:");
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
}
