
const attractions = require("../data/attractions");

const DAY_START = 9 * 60;
const DAY_END = 17 * 60;
const LUNCH_START = 12 * 60 + 30;
const LUNCH_END = 13 * 60 + 15;
const TRAVEL_BUFFER = 30;
const RETURN_BUFFER = 60;

function parseDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function timeToMinutes12(value) {
  if (typeof value !== "string") return 0;

  const match = value.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);

  if (!match) return 0;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (match[3] === "AM" && hours === 12) {
    hours = 0;
  } else if (match[3] === "PM" && hours !== 12) {
    hours += 12;
  }

  return hours * 60 + minutes;
}

function timeToMinutes(value) {
  if (typeof value !== "string") return null;

  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function getDayName(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC"
  });
}

function getDateTimeParts(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d/.test(value)
  ) {
    return null;
  }

  const date = value.slice(0, 10);
  const minutes = timeToMinutes(value.slice(11, 16));

  if (!parseDate(date) || minutes === null) {
    return null;
  }

  return { date, minutes };
}

// Convert the actual catalogue fields into the scheduler's format.
function prepareAttraction(attraction) {
  return {
    ...attraction,
    durationMinutes: Number(attraction.estimatedVisitMinutes),
    interests: [
      ...(Array.isArray(attraction.tags) ? attraction.tags : []),
      ...(attraction.category ? [attraction.category] : [])
    ],
    openingHours:
      attraction.openingTime && attraction.closingTime
        ? {
            open: attraction.openingTime,
            close: attraction.closingTime
          }
        : null,
    closedDays: Array.isArray(attraction.closedDays)
      ? attraction.closedDays
      : []
  };
}

function getOpeningWindow(place) {
  const open = timeToMinutes(place.openingHours?.open);
  const close = timeToMinutes(place.openingHours?.close);

  if (
    place.hoursVerified === true &&
    open !== null &&
    close !== null &&
    close > open
  ) {
    return { open, close, verified: true };
  }

  // Unknown or unverified hours use a planning assumption.
  return {
    open: DAY_START,
    close: DAY_END,
    verified: false
  };
}

function isClosedOn(place, dayName) {
  return (
    Array.isArray(place.closedDays) &&
    place.closedDays.some(
      day =>
        typeof day === "string" &&
        day.toLowerCase() === dayName.toLowerCase()
    )
  );
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function findAvailableSlot(
  place,
  currentTime,
  hasPreviousAttraction,
  dayStart = DAY_START,
  dayEnd = DAY_END
) {
  const window = getOpeningWindow(place);
  const travelTime = typeof hasPreviousAttraction === "number"
    ? hasPreviousAttraction
    : hasPreviousAttraction ? TRAVEL_BUFFER : 0;

  if (
    !Number.isFinite(place.durationMinutes) ||
    place.durationMinutes <= 0
  ) {
    return null;
  }

  let start = Math.max(
    currentTime + travelTime,
    window.open,
    dayStart
  );

  // Keep both the travel buffer and the attraction visit outside lunch.
  // If either would overlap 12:30–1:15 PM, move the complete travel +
  // visit block to after lunch.
  const travelStart = start - travelTime;
  const attractionEnd = start + place.durationMinutes;

  const travelOverlapsLunch =
    travelTime > 0 &&
    overlaps(
      travelStart,
      start,
      LUNCH_START,
      LUNCH_END
    );

  const attractionOverlapsLunch = overlaps(
    start,
    attractionEnd,
    LUNCH_START,
    LUNCH_END
  );

  if (travelOverlapsLunch || attractionOverlapsLunch) {
    start = Math.max(
      LUNCH_END + travelTime,
      currentTime + travelTime,
      window.open,
      dayStart
    );
  }

  const end = start + place.durationMinutes;

  if (
    start < dayStart ||
    end > dayEnd ||
    end > window.close ||
    overlaps(start, end, LUNCH_START, LUNCH_END)
  ) {
    return null;
  }

  return {
    start,
    end,
    verified: window.verified,
    travelMinutes: travelTime
  };
}

function getLunchLocation(schedule) {
  const scheduledAttractions = schedule
    .filter(item => {
      const lat = Number(item.latitude);
      const lon = Number(item.longitude);

      return (
        item.type === "attraction" &&
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
      );
    })
    .map(item => ({
      title: item.title,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      start: timeToMinutes12(item.startTime),
      end: timeToMinutes12(item.endTime)
    }));

  if (scheduledAttractions.length === 0) return null;

  const previous = scheduledAttractions
    .filter(item => item.end <= LUNCH_START)
    .sort((a, b) => b.end - a.end);

  const next = scheduledAttractions
    .filter(item => item.start >= LUNCH_END)
    .sort((a, b) => a.start - b.start);

  const nearest = previous[0] || next[0];

  if (!nearest) return null;

  return {
    lat: nearest.latitude,
    lon: nearest.longitude,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
    attractionName: nearest.title
  };
}

function normalizeInterest(value) {
  const normalized = value.trim().toLowerCase();

  const aliases = {
    history: "historical",
    beaches: "beach",
    beach: "beach",
    architecture: "architecture",
    wildlife: "wildlife",
    adventure: "adventure",
    spirituality: "spiritual",
    spiritual: "spiritual",
    culture: "culture",
    nature: "nature"
  };

  return aliases[normalized] || normalized;
}

function getDistanceKm(first, second) {
  const toRadians = value => (value * Math.PI) / 180;
  if ([first?.latitude, first?.longitude, second?.latitude, second?.longitude].some(value => value === null || value === undefined || value === "")) return null;
  const lat1 = Number(first.latitude);
  const lon1 = Number(first.longitude);
  const lat2 = Number(second.latitude);
  const lon2 = Number(second.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  if (Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) return null;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTravelMinutes(first, second) {
  const distanceKm = getDistanceKm(first, second);
  if (distanceKm === null) return TRAVEL_BUFFER;
  // Straight-line distance is adjusted to approximate road distance.
  return Math.max(10, Math.ceil((distanceKm * 1.4 / 30) * 60));
}

function generateItinerary({
  destination,
  startDate,
  endDate,
  interests = [],
  journeyPlan = null,
  selectedAttractionIds = null,
  previewOnly = false
}) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (!start || !end || end < start) {
    const error = new Error(
      "Please provide valid dates in YYYY-MM-DD format."
    );
    error.status = 400;
    throw error;
  }

  if (
    typeof destination !== "string" ||
    !destination.trim()
  ) {
    const error = new Error("Please provide a destination.");
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(interests)) {
    const error = new Error("Interests must be an array.");
    error.status = 400;
    throw error;
  }

  const dayCount =
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (dayCount > 30) {
    const error = new Error("Please plan a trip of 30 days or fewer.");
    error.status = 400;
    throw error;
  }

  if (journeyPlan !== null && typeof journeyPlan !== "object") {
    const error = new Error("Journey plan must be an object.");
    error.status = 400;
    throw error;
  }

  const selectedInterests = interests.filter(
    interest => typeof interest === "string"
  );

  const normalizedDestination = destination.trim().toLowerCase();

  // Use the full curated attraction catalogue.
  const destinationAttractions = attractions
    .filter(
      attraction =>
        typeof attraction.destination === "string" &&
        attraction.destination.trim().toLowerCase() ===
          normalizedDestination
    )
    .map(prepareAttraction)
    .filter(
      attraction =>
        attraction.name &&
        Number.isFinite(attraction.durationMinutes) &&
        attraction.durationMinutes > 0
    );

  const availableAttractions = destinationAttractions.map(place => ({
    id: place.id,
    name: place.name,
    category: place.category || "Attraction",
    description: place.description || "",
    estimatedVisitMinutes: place.durationMinutes,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    hasCoordinates: place.latitude != null && place.longitude != null && Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude))
  }));

  if (previewOnly) {
    return {
      destination: destination.trim(),
      availableAttractions,
      selectionRequired: true,
      travelEstimateNote: "Travel estimates use approximate straight-line distance adjusted for roads; actual routes and traffic may differ."
    };
  }

  if (destinationAttractions.length === 0) {
    const error = new Error(
      `No attractions are currently available for ${destination}.`
    );
    error.status = 400;
    throw error;
  }

  const normalizedInterests = selectedInterests.map(normalizeInterest);

  const preferred = normalizedInterests.length
    ? destinationAttractions.filter(place =>
        place.interests.some(interest =>
          normalizedInterests.includes(normalizeInterest(interest))
        )
      )
    : [];

  // Schedule matching attractions first, then use the rest of the
  // destination catalogue to fill the remaining sightseeing days.
  // This prevents a small set of interest matches from leaving later
  // trip days empty.
  const preferredIds = new Set(
    preferred.map(place => place.id || place.name)
  );

  const preferredSorted = [...preferred].sort(
    (a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0)
  );

  const otherAttractions = destinationAttractions
    .filter(place =>
      !preferredIds.has(place.id || place.name)
    )
    .sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0));

  let remaining = [
    ...preferredSorted,
    ...otherAttractions
  ];

  if (Array.isArray(selectedAttractionIds)) {
    const selectedIds = new Set(selectedAttractionIds.map(String));
    remaining = destinationAttractions.filter(place => selectedIds.has(String(place.id)));
    if (remaining.length === 0) {
      const error = new Error("Select at least one attraction before generating your itinerary.");
      error.status = 400;
      throw error;
    }
  }

  // Count only valid catalogue entries that can actually be scheduled.
  const selectedAttractionCount = remaining.length;

  const plan = journeyPlan || {};
  const outbound = plan.outbound || {};
  const returnJourney = plan.returnJourney || {};

  const arrival = getDateTimeParts(outbound.arrivalDateTime);
  const returnDeparture = getDateTimeParts(
    returnJourney.departureDateTime
  );

  const restDuration = Number(plan.restDurationMinutes ?? 120);

  if (
    !Number.isFinite(restDuration) ||
    restDuration < 0 ||
    restDuration > 1440
  ) {
    const error = new Error(
      "Rest duration must be between 0 and 1440 minutes."
    );
    error.status = 400;
    throw error;
  }

  const days = [];
  const lastReasons = new Map();

  // Reserve a small number of days for independent exploration on longer trips.
  // Short trips remain focused on sightseeing; longer trips get intentional free time.
  const reservedFlexibleDays = dayCount >= 10 ? 3 : dayCount >= 5 ? 2 : 0;
  const sightseeingDayLimit = Math.max(1, dayCount - reservedFlexibleDays);
  const flexibleDayIdeas = [
    "Shopping and local markets",
    "Explore local food, neighbourhoods or revisit a favourite place",
    "Relax, enjoy an optional nearby day trip or explore independently"
  ];

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
    const isReservedFlexibleDay = dayIndex >= sightseeingDayLimit;
    const remainingDays = Math.max(1, sightseeingDayLimit - dayIndex);
    const remainingVisitMinutes = remaining.reduce(
      (total, place) => total + place.durationMinutes,
      0
    );
    // Spread the remaining sightseeing workload across the remaining trip days.
    // Keep a comfortable daily visit target instead of filling each day to 5 PM.
    const dailyVisitTargetMinutes = remaining.length > 0
      ? Math.min(300, Math.ceil(remainingVisitMinutes / remainingDays))
      : 0;
    const date = new Date(start.getTime() + dayIndex * 86400000);
    const dateString = date.toISOString().slice(0, 10);
    const dayName = getDayName(date);

    const schedule = [];
    let currentTime = DAY_START;
    let dayEnd = DAY_END;
    let arrivalDay = false;
    let returnDay = false;

    // Arrival and rest are scheduled before sightseeing.
    if (arrival && arrival.date === dateString) {
      arrivalDay = true;

      const arrivalStart = arrival.minutes;
      const transferEnd = arrivalStart + TRAVEL_BUFFER;
      const restEnd = transferEnd + restDuration;

      schedule.push({
        type: "travel",
        title: `Arrive in ${destination.trim()}`,
        description: "Arrival time supplied in your journey plan.",
        durationMinutes: 0,
        startTime: formatTime(arrivalStart),
        endTime: formatTime(arrivalStart),
        hoursVerified: false
      });

      schedule.push({
        type: "travel",
        title: "Transfer to accommodation",
        description:
          "Estimated transfer buffer. Actual travel time may vary.",
        durationMinutes: TRAVEL_BUFFER,
        startTime: formatTime(arrivalStart),
        endTime: formatTime(transferEnd),
        hoursVerified: false
      });

      if (restDuration > 0) {
        schedule.push({
          type: "rest",
          title: "Hotel check-in and rest",
          description:
            "Rest period based on your selected journey-plan duration.",
          durationMinutes: restDuration,
          startTime: formatTime(transferEnd),
          endTime: formatTime(restEnd),
          hoursVerified: false
        });
      }

      currentTime = Math.max(DAY_START, restEnd);
    }

    // Leave time for the return journey.
    if (returnDeparture && returnDeparture.date === dateString) {
      returnDay = true;
      dayEnd = Math.min(
        DAY_END,
        returnDeparture.minutes - RETURN_BUFFER
      );
    }

    let attractionCount = 0;
    let dailyVisitMinutes = 0;
    let previousAttraction = null;

    // Keep reserved flexible days free of scheduled sightseeing. The user can
    // still add optional activities manually from the frontend.
    while (
      !isReservedFlexibleDay &&
      dayEnd > currentTime &&
      remaining.length > 0 &&
      (attractionCount === 0 || dailyVisitMinutes < dailyVisitTargetMinutes)
    ) {
      const candidates = [];

      for (let index = 0; index < remaining.length; index++) {
        const place = remaining[index];

        if (isClosedOn(place, dayName)) {
          lastReasons.set(place.name, `Closed on ${dayName}.`);
          continue;
        }

        const travelMinutes = previousAttraction
          ? estimateTravelMinutes(previousAttraction, place)
          : 0;
        const slot = findAvailableSlot(
          place,
          currentTime,
          travelMinutes,
          currentTime,
          dayEnd
        );

        if (!slot) {
          lastReasons.set(
            place.name,
            `Could not fit within the remaining sightseeing time on ${dateString}.`
          );
          continue;
        }

        const distanceKm = previousAttraction
          ? getDistanceKm(previousAttraction, place)
          : 0;
        const priority = Number(place.priority) || 0;
        const interestMatch = place.interests.some(interest =>
          normalizedInterests.includes(normalizeInterest(interest))
        );

        // Priority gets the day started, then proximity keeps the route
        // compact. Duration is a small tie-breaker, not the main objective.
        const score =
          priority * 2.5 +
          (interestMatch ? 4 : 0) -
          slot.travelMinutes * 0.7 -
          place.durationMinutes * 0.012 -
          (distanceKm || 0) * 0.15;

        candidates.push({ index, place, slot, score });
      }

      if (candidates.length === 0) break;

      candidates.sort((a, b) => b.score - a.score);
      const selected = candidates[0];
      const { place, slot, index } = selected;

      if (slot.travelMinutes > 0) {
        schedule.push({
          type: "travel",
          title: `Travel to ${place.name}`,
          description: "Estimated travel time based on approximate road-adjusted distance. Actual routes and traffic may vary.",
          durationMinutes: slot.travelMinutes,
          startTime: formatTime(slot.start - slot.travelMinutes),
          endTime: formatTime(slot.start),
          hoursVerified: false
        });
      }

      schedule.push({
        type: "attraction",
        id: place.id,
        title: place.name,
        description: place.description,
        latitude: place.latitude,
        longitude: place.longitude,
        durationMinutes: place.durationMinutes,
        openingHours: place.openingHours,
        closedDays: place.closedDays,
        hoursVerified: slot.verified,
        hoursNote: slot.verified
          ? "Opening hours are marked verified in the attraction dataset."
          : "Opening hours are unverified. The 9 AM–5 PM window is a planning assumption.",
        startTime: formatTime(slot.start),
        endTime: formatTime(slot.end)
      });

      currentTime = slot.end;
      previousAttraction = place;
      attractionCount++;
      dailyVisitMinutes += place.durationMinutes;
      lastReasons.delete(place.name);
      remaining.splice(index, 1);
    }

    // Add lunch on days that contain sightseeing. Do not create a
    // lunch-only day, and do not overlap arrival/rest/return events.
    // Attraction visits and their travel buffers are already kept clear
    // of the lunch window by findAvailableSlot().
    const lunchConflict = schedule.some(item => {
      if (!item.startTime || !item.endTime) return false;

      return (
        item.durationMinutes > 0 &&
        overlaps(
          timeToMinutes12(item.startTime),
          timeToMinutes12(item.endTime),
          LUNCH_START,
          LUNCH_END
        )
      );
    });

    if (attractionCount > 0 && !lunchConflict) {
      schedule.push({
        type: "break",
        title: "Lunch break",
        durationMinutes: LUNCH_END - LUNCH_START,
        startTime: formatTime(LUNCH_START),
        endTime: formatTime(LUNCH_END),
        fallbackLocation: getLunchLocation(schedule)
      });
    }

    if (returnDay && returnDeparture.minutes >= 0) {
      schedule.push({
        type: "travel",
        title: "Prepare for return journey",
        description:
          "Leave time before departure for the station, airport or pickup point.",
        durationMinutes: RETURN_BUFFER,
        startTime: formatTime(
          Math.max(0, returnDeparture.minutes - RETURN_BUFFER)
        ),
        endTime: formatTime(returnDeparture.minutes),
        hoursVerified: false
      });
    }

    schedule.sort(
      (a, b) =>
        timeToMinutes12(a.startTime) -
        timeToMinutes12(b.startTime)
    );

    days.push({
      day: dayIndex + 1,
      date: dateString,
      arrivalDay,
      returnDay,
      schedule,
      attractionCount,
      isRestDay: (attractionCount === 0 && !arrivalDay && !returnDay) || isReservedFlexibleDay,
      isFlexibleDay: isReservedFlexibleDay || (attractionCount === 0 && !arrivalDay && !returnDay),
      flexibleDayIdeas: isReservedFlexibleDay
        ? [flexibleDayIdeas[Math.min(dayIndex - sightseeingDayLimit, flexibleDayIdeas.length - 1)], "Optional activities can be added if you want a fuller day."]
        : []
    });
  }

  return {
    destination: destination.trim(),
    startDate,
    endDate,
    interests: selectedInterests,
    journeyPlan: plan,
    planningRules: {
      sightseeingStart: formatTime(DAY_START),
      sightseeingEnd: formatTime(DAY_END),
      lunchStart: formatTime(LUNCH_START),
      lunchEnd: formatTime(LUNCH_END),
      estimatedTravelBufferMinutes: TRAVEL_BUFFER,
      returnPreparationBufferMinutes: RETURN_BUFFER,
      schedulingStrategy: "Relaxed multi-day scheduling: distributes attractions across the sightseeing portion of the trip, reserves flexible days on trips of five or more days, and respects opening hours, travel, lunch, arrival and departure constraints.",
      dailySightseeingTargetMinutes: 300,
      reservedFlexibleDays,
      sightseeingDayLimit,
      unknownOpeningHoursPolicy:
        "Unknown hours use a provisional 9 AM–5 PM window and are marked unverified.",
      journeyPlanPolicy:
        "Arrival, rest and return scheduling use the journey times entered by the user. Transport availability and travel durations are not live-verified."
    },
    days,
    recommendedDays: days.filter(day => day.attractionCount > 0).length,
    flexibleDays: days.filter(day => day.isFlexibleDay).length,
    tripDurationMessage: `Your ${dayCount}-day trip includes up to ${sightseeingDayLimit} sightseeing days and ${reservedFlexibleDays} planned flexible day(s) for shopping, local experiences, relaxation or independent exploration. If the selected attractions need fewer sightseeing days, any additional unfilled days will also remain flexible.`,
    selectedAttractionCount,
    scheduledAttractionCount: days.reduce((total, day) => total + day.schedule.filter(item => item.type === "attraction").length, 0),
    travelEstimateNote: "Travel times are estimates based on approximate road-adjusted distance, not live routing or traffic. Confirm long-distance transfers before travelling.",
    unplannedAttractions: remaining.map(place => ({
      id: place.id,
      name: place.name,
      reason:
        lastReasons.get(place.name) ||
        "Could not be scheduled within the selected trip dates."
    }))
  };
}

module.exports = { generateItinerary };
