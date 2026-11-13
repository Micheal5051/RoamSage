
const destinations = require("../data/destinations");
const attractions = require("../data/attractions");

const {
  isIndianDestinationRecord,
  isIndianAttraction
} = require("./indiaOnly");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bbeaches\b/g, "beach")
    .replace(/\btemples\b/g, "temple");
}

function hasExactMatch(text, keyword) {
  const normalizedText = normalize(text);
  const normalizedKeyword = normalize(keyword);

  if (!normalizedText || !normalizedKeyword) {
    return false;
  }

  return ` ${normalizedText} `.includes(
    ` ${normalizedKeyword} `
  );
}

function getDestinationSearchableText(record) {
  return normalize([
    record.name,
    record.description,
    record.about,
    record.history,
    record.culture,
    record.category,
    ...(Array.isArray(record.tags) ? record.tags : []),
    ...(Array.isArray(record.highlights) ? record.highlights : []),
    ...(Array.isArray(record.experiences) ? record.experiences : []),
    ...(Array.isArray(record.food) ? record.food : []),
    ...(Array.isArray(record.travelInfo?.knownFor)
      ? record.travelInfo.knownFor
      : [])
  ].filter(Boolean).join(" "));
}

function calculateScore(record, interests, searchableText = null) {
  if (!interests.length) return 0;

  const tags = Array.isArray(record.tags)
    ? record.tags.map(normalize)
    : [];

  const category = normalize(record.category);

  const text = searchableText === null
    ? getDestinationSearchableText(record)
    : searchableText;

  let score = 0;

  for (const interest of interests) {
    const keyword = normalize(interest);

    if (!keyword) continue;

    if (
      tags.includes(keyword) ||
      category === keyword
    ) {
      score += 3;
    } else if (hasExactMatch(text, keyword)) {
      score += 1;
    }
  }

  const maximumScore = interests.length * 3;

  return Math.round((score / maximumScore) * 100);
}

function getMatchedInterests(
  record,
  interests,
  searchableText = null
) {
  const tags = Array.isArray(record.tags)
    ? record.tags.map(normalize)
    : [];

  const category = normalize(record.category);

  const text = searchableText === null
    ? getDestinationSearchableText(record)
    : searchableText;

  return interests.filter(interest => {
    const keyword = normalize(interest);

    return (
      tags.includes(keyword) ||
      category === keyword ||
      hasExactMatch(text, keyword)
    );
  });
}

function getRecommendations(preferences = {}) {
  const interests = Array.isArray(preferences.interests)
    ? [
        ...new Set(
          preferences.interests
            .map(normalize)
            .filter(Boolean)
        )
      ]
    : [];

  if (!interests.length) {
    return {
      success: false,
      message: "Please select at least one interest.",
      recommendations: [],
      attractions: []
    };
  }

  const destinationRecommendations = destinations
    .filter(isIndianDestinationRecord)
    .map(destination => {
      const searchableText =
        getDestinationSearchableText(destination);

      return {
        name: destination.name,
        country: "India",
        description: destination.description,
        image: destination.image,
        score: calculateScore(
          destination,
          interests,
          searchableText
        ),
        matchedInterests: getMatchedInterests(
          destination,
          interests,
          searchableText
        )
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const attractionRecommendations = attractions
    .filter(isIndianAttraction)
    .map(attraction => ({
      id: attraction.id,
      name: attraction.name,
      destination: attraction.destination,
      category: attraction.category,
      description: attraction.description,
      image: attraction.image,
      score: calculateScore(
        attraction,
        interests,
        ""
      ),
      matchedInterests: getMatchedInterests(
        attraction,
        interests,
        ""
      )
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return {
    success: true,
    selectedInterests: interests,
    recommendations: destinationRecommendations,
    attractions: attractionRecommendations
  };
}

module.exports = {
  getRecommendations,
  calculateScore
};
