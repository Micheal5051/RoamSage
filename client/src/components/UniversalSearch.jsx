
import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "../config/api";
import "./UniversalSearch.css";

const categories = ["All", "Places", "Hotels", "Food", "Activities"];
const API_URL = apiUrl("/api/search");

// ACTIVITY IMAGES
const attractionImages = {
  charminar:
    "https://upload.wikimedia.org/wikipedia/commons/d/d1/Charminar-Pride_of_Hyderabad.jpg",
  "mecca-masjid":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018110376-1.jpg",
  "laad-bazaar":
    "https://cms.neomaxer.com/uploads/large_Article_1_4e57b9d168.png",
  "chowmahalla-palace":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018110394-1-1024x688.jpg",
  "salar-jung-museum":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018110230.jpg",
  "golconda-fort":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018111488.jpg",
  "qutb-shahi-tombs":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018111498-2.jpg",
  "hussain-sagar":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2022/03/2022031651.jpg",
  "birla-mandir":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018111410.jpg",
  "nehru-zoological-park":
    "https://cdn.s3waas.gov.in/s36c524f9d5d7027454a783c841250ba71/uploads/2018/11/2018110358.jpg"
};

// HOTEL IMAGES
// IDs match server/data/hotels.js
const hotelImages = {
  // Hyderabad
  hotel001:
    "https://cache.marriott.com/content/dam/marriott-renditions/HYDLK/hydlk-exterior-8197-hor-clsc.jpg?downsize=1215px%3A%2A&interpolation=progressive-bilinear&output-quality=70",
  hotel002:
    "https://y.cdrst.com/foto/hotel-sf/54303/granderesp/trident-hyderabad-exterior-146799a8.jpg",
  hotel003:
    "https://www.travenix.com/wp-content/uploads/2023/12/ITC-Kakatiya.jpg",
  hotel004:
    "https://r1imghtlak.mmtcdn.com/fd7f110cbb7311ee89f90a58a9feac02.jpg",

  // Goa
  hotel005:
    "https://www.itchotels.com/content/dam/itchotels/in/umbrella/itc/hotels/itcgrandgoa-goa/gallery/overview/resort-exterior.png",
  hotel006:
    "https://weddingsutra.com/images/Vendor_Images/Venues/hyatt-goa/hyatt-goa-10.jpg",
  hotel007:
    "https://media-cdn.tripadvisor.com/media/photo-s/0f/51/c6/47/street--v16174569.jpg",
  hotel008:
    "https://cache.marriott.com/marriottassets/marriott/GOIMC/goimc-exterior-3043-hor-feat.jpg"
};

// DESTINATION IMAGES
const destinationImages = {
  goa:
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop",

  hyderabad:
    "https://upload.wikimedia.org/wikipedia/commons/d/d1/Charminar-Pride_of_Hyderabad.jpg"
};

// NORMALIZE TEXT
const normalizeName = (name = "") =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

// GET ALL POSSIBLE IMAGES
const getResultImages = (item, type) => {
  const images = [];

  // Backend image first
  if (item.image) {
    images.push(item.image);
  }

  if (type === "places") {
    const name = normalizeName(item.name);

    if (destinationImages[name]) {
      images.push(destinationImages[name]);
    }
  }

  if (type === "hotels") {
    if (hotelImages[item.id]) {
      images.push(hotelImages[item.id]);
    }
  }

  if (type === "activities") {
    const id = normalizeName(item.id);

    if (attractionImages[id]) {
      images.push(attractionImages[id]);
    }
  }

  return [...new Set(images)];
};

// IMAGE COMPONENT WITH AUTOMATIC FALLBACK
function ResultThumbnail({ item, type, icon }) {
  const images = getResultImages(item, type);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [item.id, item._id, item.image, type]);

  if (images.length > 0 && imageIndex < images.length) {
    return (
      <span className="universal-search-thumbnail">
        <img
          src={images[imageIndex]}
          alt={item.name || "Search result"}
          loading="lazy"
          onError={() => {
            setImageIndex((current) => current + 1);
          }}
        />
      </span>
    );
  }

  return (
    <span className="suggestion-icon universal-search-thumbnail-fallback">
      {icon}
    </span>
  );
}

function UniversalSearch({
  destinations = [],
  onDestinationSelect,
}) {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedFoodDestination, setSelectedFoodDestination] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [activitySuggestions, setActivitySuggestions] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [hotelLoading, setHotelLoading] = useState(false);

  const [allSuggestions, setAllSuggestions] = useState({
    hotels: [],
    activities: []
  });
  const [allSuggestionsLoading, setAllSuggestionsLoading] = useState(false);

  const searchRef = useRef(null);

  // The backend returns only destinations from the supported India catalogue.
  const indianDestinations = useMemo(
    () =>
      destinations
        .filter(
          (destination) =>
            destination &&
            typeof destination.name === "string" &&
            Number.isFinite(Number(destination.latitude)) &&
            Number.isFinite(Number(destination.longitude))
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [destinations]
  );

  useEffect(() => {
    if (
      selectedFoodDestination &&
      !indianDestinations.some(
        (destination) => destination.name === selectedFoodDestination
      )
    ) {
      setSelectedFoodDestination("");
    }
  }, [indianDestinations, selectedFoodDestination]);

  // OPEN EXPLORE PAGE
  const openExplorePage = (destinationName) => {
    if (!destinationName?.trim()) return;

    const destination = destinationName.trim();

    if (onDestinationSelect) {
      onDestinationSelect(destination);
    } else {
      navigate(`/explore/${encodeURIComponent(destination)}`);
    }
  };

  // DESTINATION AUTOCOMPLETE
  const suggestions = useMemo(() => {
    const searchText = query.trim().toLowerCase();

    if (
      !searchText ||
      category === "Hotels" ||
      category === "Food" ||
      category === "Activities"
    ) {
      return [];
    }

    return destinations
      .filter((destination) => {
        const searchableText = [
          destination.name,
          destination.country,
          destination.description,
          ...(Array.isArray(destination.tags)
            ? destination.tags
            : [])
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(searchText);
      })
      .slice(0, 6);
  }, [query, category, destinations]);

  // ALL-CATEGORY AUTOCOMPLETE
  useEffect(() => {
    const searchText = query.trim();

    if (category !== "All" || searchText.length < 2) {
      setAllSuggestions({ hotels: [], activities: [] });
      setAllSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setAllSuggestionsLoading(true);

        // Food autocomplete is intentionally excluded here. Restaurant search
        // needs an explicitly selected Indian destination first.
        const types = ["hotels", "activities"];
        const responses = await Promise.all(
          types.map(async (type) => {
            try {
              const response = await fetch(
                `${API_URL}?q=${encodeURIComponent(searchText)}&type=${type}`,
                { signal: controller.signal }
              );

              if (!response.ok) return [type, []];

              const data = await response.json();
              return [type, data.results?.[type] || []];
            } catch (err) {
              if (err.name === "AbortError") throw err;
              console.error(`${type} autocomplete failed:`, err);
              return [type, []];
            }
          })
        );

        if (!controller.signal.aborted) {
          setAllSuggestions(Object.fromEntries(responses));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("All-category suggestions failed:", err);
          setAllSuggestions({ hotels: [], activities: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setAllSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category]);

  // HOTEL AUTOCOMPLETE
  useEffect(() => {
    const searchText = query.trim();

    if (category !== "Hotels" || searchText.length < 2) {
      setHotelSuggestions([]);
      setHotelLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setHotelLoading(true);

        const response = await fetch(
          `${API_URL}?q=${encodeURIComponent(searchText)}&type=hotels`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load hotel suggestions.");
        }

        const data = await response.json();
        setHotelSuggestions(data.results?.hotels || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Hotel suggestions failed:", err);
          setHotelSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setHotelLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category]);

  // ACTIVITY AUTOCOMPLETE
  useEffect(() => {
    const searchText = query.trim();

    if (category !== "Activities" || searchText.length < 2) {
      setActivitySuggestions([]);
      setActivityLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setActivityLoading(true);

        const response = await fetch(
          `${API_URL}?q=${encodeURIComponent(searchText)}&type=activities`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load activity suggestions.");
        }

        const data = await response.json();

        setActivitySuggestions(
          data.results?.activities || []
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Activity suggestions failed:", err);
          setActivitySuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setActivityLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, category]);

  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // SEARCH SUBMISSION
  const handleSubmit = async (event) => {
    event.preventDefault();

    const searchText = query.trim();

    if (!searchText) {
      setResults(null);
      setError("Please enter something to search.");
      setShowSuggestions(true);
      return;
    }

    if (category === "Food" && !selectedFoodDestination) {
      setResults(null);
      setError("Choose an Indian destination before searching for restaurants.");
      setShowSuggestions(true);
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);
    setShowSuggestions(true);

    try {
      let combinedData;

      // SEARCH ALL LOCAL CATEGORIES. Food is kept separate because it needs
      // an explicit destination and must never geocode the search words.
      if (category === "All") {
        const types = [
          "places",
          "hotels",
          "activities"
        ];

        const responses = await Promise.all(
          types.map(async (type) => {
            const response = await fetch(
              `${API_URL}?q=${encodeURIComponent(searchText)}&type=${type}`
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.message || `Unable to search ${type}.`
              );
            }

            return data;
          })
        );

        combinedData = {
          query: searchText,
          type: "all",
          total: responses.reduce(
            (sum, data) => sum + (data.total || 0),
            0
          ),
          results: {
            places: [],
            hotels: [],
            food: [],
            activities: []
          }
        };

        responses.forEach((data) => {
          Object.keys(combinedData.results).forEach((type) => {
            combinedData.results[type].push(
              ...(data.results?.[type] || [])
            );
          });
        });
      } else {
        // Food searches send the restaurant name and selected destination as
        // separate parameters. The backend uses destination coordinates.
        const selectedType = category.toLowerCase();
        const params = new URLSearchParams({
          q: searchText,
          type: selectedType
        });

        if (category === "Food") {
          params.set("destination", selectedFoodDestination);
        }

        const response = await fetch(
          `${API_URL}?${params.toString()}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Search request failed."
          );
        }

        combinedData = data;
      }

      setResults(combinedData);
    } catch (err) {
      console.error("Universal search failed:", err);

      setError(
        err.message || "Unable to search right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // DESTINATION SUGGESTION CLICK
  const handleSuggestionClick = (destination) => {
    setQuery(destination.name);
    setResults(null);
    setError("");
    setShowSuggestions(false);

    openExplorePage(destination.name);
  };

  // HOTEL SUGGESTION CLICK
  const handleHotelSuggestionClick = (hotel) => {
    setQuery(hotel.name);
    setResults(null);
    setError("");
    setShowSuggestions(false);
    navigate(`/hotels/${hotel.id}`);
  };

  // ACTIVITY SUGGESTION CLICK
  const handleActivitySuggestionClick = (activity) => {
    setQuery(activity.name);
    setResults(null);
    setError("");
    setShowSuggestions(false);

    navigate(`/activities/${activity.id}`);
  };

  // CLEAR SEARCH
  const handleClear = () => {
    setQuery("");
    setResults(null);
    setError("");
    setActivitySuggestions([]);
    setHotelSuggestions([]);
    setAllSuggestions({ hotels: [], activities: [] });
    setShowSuggestions(false);
  };

  // CATEGORY CHANGE
  const handleCategoryChange = (item) => {
    setCategory(item);
    setResults(null);
    setError("");
    setActivitySuggestions([]);
    setHotelSuggestions([]);
    setAllSuggestions({ hotels: [], activities: [] });
    setShowSuggestions(Boolean(query.trim()));
  };

  // FORMAT HOTEL PRICE
  const formatPrice = (price) => {
    if (!price || typeof price.amount !== "number") {
      return "Price not available";
    }

    return `₹${price.amount.toLocaleString("en-IN")} ${
      price.period || ""
    }`;
  };

  // RESULT CLICK
  const handleResultClick = (item, type) => {
    setShowSuggestions(false);

    if (type === "hotels") {
      navigate(`/hotels/${item.id}`);
      return;
    }

    if (type === "activities") {
      navigate(`/activities/${item.id}`);
      return;
    }

    if (type === "places") {
      if (item.name) {
        openExplorePage(item.name);
      } else {
        setError("Destination name is unavailable.");
      }
    }
  };

  // DISPLAY SEARCH RESULTS
  const renderResults = () => {
    if (!results) return null;

    const resultGroups = [
      {
        title: "Places",
        items: results.results?.places || [],
        type: "places"
      },
      {
        title: "Hotels",
        items: results.results?.hotels || [],
        type: "hotels"
      },
      {
        title: "Food",
        items: results.results?.food || [],
        type: "food"
      },
      {
        title: "Activities",
        items: results.results?.activities || [],
        type: "activities"
      }
    ];

    if (results.total === 0) {
      return (
        <p className="universal-search-message">
          No matching results found. Try another search.
        </p>
      );
    }

    return (
      <>
        <p className="universal-search-label">
          {results.total} result
          {results.total !== 1 ? "s" : ""} found
        </p>

        {resultGroups.map((group) => {
          if (group.items.length === 0) return null;

          return (
            <div
              className="universal-search-result-group"
              key={group.type}
            >
              <p className="universal-search-label">
                {group.title}
              </p>

              {group.items.map((item) => {
                const itemContent = (
                  <>
                    <ResultThumbnail
                      item={item}
                      type={group.type}
                      icon={
                        group.type === "hotels"
                          ? "⌂"
                          : group.type === "food"
                          ? "🍽"
                          : group.type === "activities"
                          ? "✦"
                          : "⌖"
                      }
                    />

                    <span className="universal-search-result-details">
                      <strong>{item.name}</strong>

                      <small>
                        {group.type === "food"
                          ? item.address || "Address unavailable"
                          : item.destination ||
                            item.country ||
                            item.category ||
                            "Travel Explorer"}
                      </small>

                      {group.type === "hotels" && (
                        <small>
                          {formatPrice(item.price)}
                          {item.price?.isEstimate
                            ? " · Estimated"
                            : ""}
                        </small>
                      )}

                      {group.type === "activities" && (
                        <small>
                          {item.category || "Activity"}
                          {item.estimatedVisitMinutes
                            ? ` · ${item.estimatedVisitMinutes} min`
                            : ""}
                        </small>
                      )}

                      {group.type === "food" && (
                        <>
                          <small>
                            {item.category || "Restaurant"}
                          </small>

                          <small>
                            {typeof item.distance === "number"
                              ? `${item.distance} km away`
                              : "Distance unavailable"}
                          </small>
                        </>
                      )}
                    </span>

                    <span className="suggestion-arrow">
                      ↗
                    </span>
                  </>
                );

                if (group.type === "food" && item.mapsUrl) {
                  return (
                    <a
                      className="universal-search-suggestion"
                      key={item.id || item.name}
                      href={item.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Get directions to ${item.name}`}
                    >
                      {itemContent}
                    </a>
                  );
                }

                return (
                  <button
                    type="button"
                    className="universal-search-suggestion"
                    key={item._id || item.id || item.name}
                    onClick={() =>
                      handleResultClick(item, group.type)
                    }
                    disabled={
                      group.type !== "places" &&
                      group.type !== "hotels" &&
                      group.type !== "activities"
                    }
                  >
                    {itemContent}
                  </button>
                );
              })}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="universal-search" ref={searchRef}>
      <div className="universal-search-categories">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "active" : ""}
            onClick={() => handleCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {category === "Food" && (
        <div className="universal-search-location-row">
          <label htmlFor="universal-food-destination">
            Search restaurants in
          </label>
          <select
            id="universal-food-destination"
            value={selectedFoodDestination}
            onChange={(event) => {
              setSelectedFoodDestination(event.target.value);
              setResults(null);
              setError("");
              setShowSuggestions(Boolean(query.trim()));
            }}
          >
            <option value="">Choose an Indian destination</option>
            {indianDestinations.map((destination) => (
              <option key={destination._id || destination.name} value={destination.name}>
                {destination.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <form
        className="universal-search-form"
        onSubmit={handleSubmit}
      >
        <span className="universal-search-icon">⌕</span>

        <input
          type="text"
          value={query}
          placeholder="Search places, hotels, food and experiences..."
          onChange={(event) => {
            setQuery(event.target.value);
            setResults(null);
            setError("");
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {query && (
          <button
            type="button"
            className="universal-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}

        <button
          type="submit"
          className="universal-search-submit"
          disabled={loading || (category === "Food" && !selectedFoodDestination)}
        >
          {loading ? "Searching..." : "Search ↗"}
        </button>
      </form>

      {showSuggestions && query.trim() && (
        <div className="universal-search-dropdown">
          {loading ? (
            <p className="universal-search-message">
              Searching Travel Explorer...
            </p>
          ) : error ? (
            <p className="universal-search-message">
              {error}
            </p>
          ) : results ? (
            <>
              {renderResults()}
              {category === "All" && (
                <p className="universal-search-message">
                  To search restaurants, choose Food and select an Indian destination.
                </p>
              )}
            </>
          ) : category === "All" ? (
            allSuggestionsLoading ? (
              <p className="universal-search-message">
                Finding matching places, hotels and activities...
              </p>
            ) : (suggestions.length + allSuggestions.hotels.length + allSuggestions.activities.length) > 0 ? (
              <>
                {suggestions.length > 0 && (
                  <div className="universal-search-result-group">
                    <p className="universal-search-label">Suggested destinations</p>
                    {suggestions.slice(0, 3).map((destination) => (
                      <button
                        type="button"
                        className="universal-search-suggestion"
                        key={destination._id || destination.name}
                        onClick={() => handleSuggestionClick(destination)}
                      >
                        <ResultThumbnail item={destination} type="places" icon="⌖" />
                        <span className="universal-search-result-details">
                          <strong>{destination.name}</strong>
                          <small>{destination.country || "Destination"}</small>
                        </span>
                        <span className="suggestion-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                )}

                {allSuggestions.hotels.length > 0 && (
                  <div className="universal-search-result-group">
                    <p className="universal-search-label">Suggested hotels</p>
                    {allSuggestions.hotels.slice(0, 3).map((hotel) => (
                      <button
                        type="button"
                        className="universal-search-suggestion"
                        key={hotel._id || hotel.id || hotel.name}
                        onClick={() => handleHotelSuggestionClick(hotel)}
                      >
                        <ResultThumbnail item={hotel} type="hotels" icon="⌂" />
                        <span className="universal-search-result-details">
                          <strong>{hotel.name}</strong>
                          <small>{hotel.destination || hotel.city || "Hotel"}</small>
                          <small>{formatPrice(hotel.price)}</small>
                        </span>
                        <span className="suggestion-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                )}

                {allSuggestions.activities.length > 0 && (
                  <div className="universal-search-result-group">
                    <p className="universal-search-label">Suggested activities</p>
                    {allSuggestions.activities.slice(0, 3).map((activity) => (
                      <button
                        type="button"
                        className="universal-search-suggestion"
                        key={activity.id || activity.name}
                        onClick={() => handleActivitySuggestionClick(activity)}
                      >
                        <ResultThumbnail item={activity} type="activities" icon="✦" />
                        <span className="universal-search-result-details">
                          <strong>{activity.name}</strong>
                          <small>{activity.destination || "Activity"}</small>
                          <small>{activity.category || "Activity"}</small>
                        </span>
                        <span className="suggestion-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="universal-search-message">
                No matching suggestions. Press Search to check all available results.
              </p>
            )
          ) : category === "Hotels" ? (
            hotelLoading ? (
              <p className="universal-search-message">
                Finding matching hotels...
              </p>
            ) : hotelSuggestions.length > 0 ? (
              <>
                <p className="universal-search-label">
                  Suggested hotels
                </p>

                {hotelSuggestions.map((hotel) => (
                  <button
                    type="button"
                    className="universal-search-suggestion"
                    key={hotel._id || hotel.id}
                    onClick={() => handleHotelSuggestionClick(hotel)}
                  >
                    <ResultThumbnail
                      item={hotel}
                      type="hotels"
                      icon="⌂"
                    />

                    <span className="universal-search-result-details">
                      <strong>{hotel.name}</strong>
                      <small>
                        {hotel.destination || hotel.city || "Hotel"}
                      </small>
                      <small>{formatPrice(hotel.price)}</small>
                    </span>

                    <span className="suggestion-arrow">
                      ↗
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <p className="universal-search-message">
                No matching hotels found. Try another name.
              </p>
            )
          ) : category === "Activities" ? (
            activityLoading ? (
              <p className="universal-search-message">
                Finding matching activities...
              </p>
            ) : activitySuggestions.length > 0 ? (
              <>
                <p className="universal-search-label">
                  Suggested activities
                </p>

                {activitySuggestions.map((activity) => (
                  <button
                    type="button"
                    className="universal-search-suggestion"
                    key={activity.id}
                    onClick={() =>
                      handleActivitySuggestionClick(activity)
                    }
                  >
                    <ResultThumbnail
                      item={activity}
                      type="activities"
                      icon="✦"
                    />

                    <span className="universal-search-result-details">
                      <strong>{activity.name}</strong>

                      <small>
                        {activity.destination || "Hyderabad"}
                      </small>

                      <small>
                        {activity.category || "Activity"}
                        {activity.estimatedVisitMinutes
                          ? ` · ${activity.estimatedVisitMinutes} min`
                          : ""}
                      </small>
                    </span>

                    <span className="suggestion-arrow">
                      ↗
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <p className="universal-search-message">
                No matching activities found. Try another name.
              </p>
            )
          ) : category === "Food" ? (
            <p className="universal-search-message">
              {selectedFoodDestination
                ? `Press Search to find restaurants and cafes in ${selectedFoodDestination}.`
                : "Choose an Indian destination above before searching for restaurants."}
            </p>
          ) : suggestions.length > 0 ? (
            <>
              <p className="universal-search-label">
                Suggested destinations
              </p>

              {suggestions.map((destination) => (
                <button
                  type="button"
                  className="universal-search-suggestion"
                  key={destination._id || destination.name}
                  onClick={() =>
                    handleSuggestionClick(destination)
                  }
                >
                  <ResultThumbnail
                    item={destination}
                    type="places"
                    icon="⌖"
                  />

                  <span>
                    <strong>{destination.name}</strong>
                    <small>
                      {destination.country || "Destination"}
                    </small>
                  </span>

                  <span className="suggestion-arrow">
                    ↗
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="universal-search-message">
              No matching suggestions. Press Search to check all available results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default UniversalSearch;
