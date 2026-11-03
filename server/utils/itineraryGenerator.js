const HYDERABAD_ATTRACTIONS = [
  {
    name: "Charminar",
    description: "Explore Hyderabad’s iconic historic monument and the surrounding old city.",
    latitude: 17.3616,
    longitude: 78.4747,
    durationMinutes: 75,
    interests: ["History", "Architecture", "Shopping"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Chowmahalla Palace",
    description: "Discover the palace complex and its historic courtyards.",
    latitude: 17.3578,
    longitude: 78.4717,
    durationMinutes: 75,
    interests: ["History", "Architecture"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Salar Jung Museum",
    description: "Browse a large collection of art, antiques, and historical objects.",
    latitude: 17.3713,
    longitude: 78.4804,
    durationMinutes: 90,
    interests: ["History", "Architecture"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Hussain Sagar Lake",
    description: "Enjoy views of the lake and a relaxed outdoor stop.",
    latitude: 17.4239,
    longitude: 78.4738,
    durationMinutes: 60,
    interests: ["Nature"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Birla Mandir",
    description: "Visit the hilltop temple and enjoy views across the city.",
    latitude: 17.4062,
    longitude: 78.4691,
    durationMinutes: 60,
    interests: ["History", "Architecture"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Golconda Fort",
    description: "Explore the historic fort complex. Allow extra time for walking uphill.",
    latitude: 17.3833,
    longitude: 78.4011,
    durationMinutes: 100,
    interests: ["History", "Architecture"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "Shilparamam",
    description: "Explore arts, crafts, and cultural displays at this village-style complex.",
    latitude: 17.4523,
    longitude: 78.3793,
    durationMinutes: 75,
    interests: ["Shopping", "Culture"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  },
  {
    name: "KBR National Park",
    description: "Take a nature walk in a green space within the city.",
    latitude: 17.4239,
    longitude: 78.4235,
    durationMinutes: 60,
    interests: ["Nature"],
    openingHours: null,
    closedDays: null,
    hoursVerified: false
  }
];

const DAY_START = 9 * 60;
const DAY_END = 17 * 60;
const LUNCH_START = 12 * 60 + 30;
const LUNCH_END = 13 * 60 + 15;
const TRAVEL_BUFFER = 30;
const RETURN_BUFFER = 60;
const MAX_ATTRACTIONS_PER_DAY = 3;

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

// Accepts datetime-local values such as "2026-11-03T11:00".
function getDateTimeParts(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d/.test(value)
  ) {
    return null;
  }

  const date = value.slice(0, 10);
  const time = value.slice(11, 16);
  const minutes = timeToMinutes(time);

  if (!parseDate(date) || minutes === null) {
    return null;
  }

  return { date, minutes };
}

function getOpeningWindow(place) {
  if (
    place.hoursVerified === true &&
    place.openingHours &&
    typeof place.openingHours.open === "string" &&
    typeof place.openingHours.close === "string"
  ) {
    const open = timeToMinutes(place.openingHours.open);
    const close = timeToMinutes(place.openingHours.close);

    if (open !== null && close !== null && close > open) {
      return { open, close, verified: true };
    }
  }

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
      (day) =>
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
  const travelTime = hasPreviousAttraction ? TRAVEL_BUFFER : 0;

  let start = Math.max(
    currentTime + travelTime,
    window.open,
    dayStart
  );

  if (
    start < LUNCH_START &&
    start + place.durationMinutes > LUNCH_START
  ) {
    start = Math.max(LUNCH_END, currentTime + travelTime);
  } else if (start >= LUNCH_START && start < LUNCH_END) {
    start = Math.max(LUNCH_END, currentTime + travelTime);
  }

  const end = start + place.durationMinutes;

  if (start < dayStart || end > dayEnd || end > window.close) {
    return null;
  }

  if (overlaps(start, end, LUNCH_START, LUNCH_END)) {
    return null;
  }

  return {
    start,
    end,
    verified: window.verified,
    travelMinutes: travelTime
  };
}

// Get coordinates from the attraction closest to the lunch break.
function getLunchLocation(schedule) {
  const attractions = schedule
    .filter((item) => {
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
    .map((item) => ({
      title: item.title,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      start: timeToMinutes12(item.startTime),
      end: timeToMinutes12(item.endTime)
    }));

  if (attractions.length === 0) {
    return null;
  }

  const previousAttractions = attractions
    .filter((item) => item.end <= LUNCH_START)
    .sort((a, b) => b.end - a.end);

  const nextAttractions = attractions
    .filter((item) => item.start >= LUNCH_END)
    .sort((a, b) => a.start - b.start);

  const nearest =
    previousAttractions[0] || nextAttractions[0];

  if (!nearest) {
    return null;
  }

  return {
    lat: nearest.latitude,
    lon: nearest.longitude,
    latitude: nearest.latitude,
    longitude: nearest.longitude,
    attractionName: nearest.title
  };
}

function generateItinerary({
  destination,
  startDate,
  endDate,
  interests = [],
  journeyPlan = null
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

  if (!Array.isArray(interests)) {
    const error = new Error("Interests must be an array.");
    error.status = 400;
    throw error;
  }

  if (
    typeof destination !== "string" ||
    destination.trim().toLowerCase() !== "hyderabad"
  ) {
    const error = new Error(
      "The current attraction dataset supports Hyderabad only."
    );
    error.status = 400;
    throw error;
  }

  const dayCount =
    Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (dayCount > 10) {
    const error = new Error("Please plan a trip of 10 days or fewer.");
    error.status = 400;
    throw error;
  }

  if (journeyPlan !== null && typeof journeyPlan !== "object") {
    const error = new Error("Journey plan must be an object.");
    error.status = 400;
    throw error;
  }

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

  const selectedInterests = interests.filter(
    (interest) => typeof interest === "string"
  );

  const preferred = selectedInterests.length
    ? HYDERABAD_ATTRACTIONS.filter((place) =>
        place.interests.some((interest) =>
          selectedInterests.some(
            (selected) =>
              selected.toLowerCase() === interest.toLowerCase()
          )
        )
      )
    : HYDERABAD_ATTRACTIONS;

  const remaining = [
    ...(preferred.length ? preferred : HYDERABAD_ATTRACTIONS)
  ];

  const days = [];
  const lastReasons = new Map();

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex++) {
    const date = new Date(start.getTime() + dayIndex * 86400000);
    const dateString = date.toISOString().slice(0, 10);
    const dayName = getDayName(date);

    const schedule = [];
    let currentTime = DAY_START;
    let dayEnd = DAY_END;
    let arrivalDay = false;
    let returnDay = false;

    // On arrival day, schedule arrival, transfer and rest first.
    if (arrival && arrival.date === dateString) {
      arrivalDay = true;

      const arrivalStart = arrival.minutes;
      const transferEnd = arrivalStart + TRAVEL_BUFFER;
      const restEnd = transferEnd + restDuration;

      schedule.push({
        type: "travel",
        title: "Arrive in Hyderabad",
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

    // On the return day, stop sightseeing before departure.
    if (returnDeparture && returnDeparture.date === dateString) {
      returnDay = true;
      dayEnd = Math.min(
        DAY_END,
        returnDeparture.minutes - RETURN_BUFFER
      );
    }

    // Only schedule attractions when there is usable sightseeing time.
    let attractionCount = 0;

    if (dayEnd > currentTime) {
      for (let index = 0; index < remaining.length;) {
        if (attractionCount >= MAX_ATTRACTIONS_PER_DAY) {
          break;
        }

        const place = remaining[index];

        if (isClosedOn(place, dayName)) {
          lastReasons.set(
            place.name,
            `Marked closed on ${dayName}.`
          );
          index++;
          continue;
        }

        const slot = findAvailableSlot(
          place,
          currentTime,
          attractionCount > 0,
          currentTime,
          dayEnd
        );

        if (!slot) {
          lastReasons.set(
            place.name,
            `Could not fit within the available time on ${dateString}.`
          );
          index++;
          continue;
        }

        schedule.push({
          type: "attraction",
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
        attractionCount++;
        lastReasons.delete(place.name);
        remaining.splice(index, 1);
      }
    }

    // Add lunch only if it does not overlap arrival, transfer or rest.
    const lunchConflictsWithJourney = schedule.some((item) => {
      if (!item.startTime || !item.endTime) return false;

      const itemStart = timeToMinutes12(item.startTime);
      const itemEnd = timeToMinutes12(item.endTime);

      return (
        item.durationMinutes > 0 &&
        overlaps(itemStart, itemEnd, LUNCH_START, LUNCH_END)
      );
    });

    if (!lunchConflictsWithJourney) {
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
        timeToMinutes12(a.startTime) - timeToMinutes12(b.startTime)
    );

    days.push({
      day: dayIndex + 1,
      date: dateString,
      arrivalDay,
      returnDay,
      schedule
    });
  }

  return {
    destination: "Hyderabad",
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
      maxAttractionsPerDay: MAX_ATTRACTIONS_PER_DAY,
      unknownOpeningHoursPolicy:
        "Unknown hours use a provisional 9 AM–5 PM window and are marked unverified.",
      journeyPlanPolicy:
        "Arrival, rest and return scheduling use the journey times entered by the user. Transport availability and travel durations are not live-verified."
    },
    days,
    unplannedAttractions: remaining.map((place) => ({
      name: place.name,
      reason:
        lastReasons.get(place.name) ||
        "Could not be scheduled within the selected trip dates."
    }))
  };
}

module.exports = { generateItinerary };