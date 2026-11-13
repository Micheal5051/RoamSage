import { apiUrl } from "../config/api";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./AttractionDetails.css";

function AttractionDetails() {
  const { id } = useParams();

  const [attraction, setAttraction] = useState(null);
  const [destinationId, setDestinationId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchAttraction() {
      try {
        setLoading(true);
        setError("");
        setAttraction(null);
        setDestinationId("");
        setImageError(false);

        const response = await fetch(
          apiUrl(`/api/activities/${id}`)
        );

        if (!response.ok) {
          throw new Error("Attraction not found");
        }

        const data = await response.json();

        if (cancelled) return;

        setAttraction(data);

        const destinationsResponse = await fetch(
          apiUrl("/api/destinations")
        );

        if (destinationsResponse.ok) {
          const destinations = await destinationsResponse.json();

          const matchingDestination = destinations.find(
            (destination) =>
              destination.name?.trim().toLowerCase() ===
              data.destination?.trim().toLowerCase()
          );

          if (!cancelled && matchingDestination) {
            setDestinationId(matchingDestination._id);
          }
        }
      } catch (err) {
        console.error("Attraction error:", err);

        if (!cancelled) {
          setError(err.message || "Unable to load attraction details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAttraction();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="attraction-state-page">
        <div className="attraction-loader"></div>
        <p>Discovering this place...</p>
      </main>
    );
  }

  if (error || !attraction) {
    return (
      <main className="attraction-state-page">
        <span className="attraction-state-icon">✧</span>
        <span className="attraction-section-label">
          LET'S TRY AGAIN
        </span>
        <h2>Place unavailable</h2>
        <p>{error || "We couldn't find this attraction."}</p>
        <Link to="/" className="attraction-back-button">
          Back to Explore
        </Link>
      </main>
    );
  }

  const hasCoordinates =
    attraction.latitude != null &&
    attraction.longitude != null;

  const estimatedHours = attraction.estimatedVisitMinutes
    ? Math.floor(attraction.estimatedVisitMinutes / 60)
    : 0;

  const estimatedMinutes = attraction.estimatedVisitMinutes
    ? attraction.estimatedVisitMinutes % 60
    : 0;

  const visitDuration = attraction.estimatedVisitMinutes
    ? [
        estimatedHours > 0 ? `${estimatedHours} hr` : "",
        estimatedMinutes > 0 ? `${estimatedMinutes} min` : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "Not available";

  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${attraction.latitude},${attraction.longitude}`
    : null;

  const nearbyHotelsUrl = destinationId
    ? `/hotels?destinationId=${encodeURIComponent(
        destinationId
      )}&attractionId=${encodeURIComponent(attraction.id)}`
    : null;

  return (
    <main className="attraction-details-page">
      <div className="attraction-details-container">

        {/* TOP NAVIGATION */}
        <div className="attraction-top-navigation">
          <Link
            to={`/explore/${encodeURIComponent(attraction.destination)}`}
            className="attraction-back-link"
          >
            <span>←</span> Back to {attraction.destination}
          </Link>

          <span className="attraction-page-caption">
            YOUR TRAVEL JOURNAL
          </span>
        </div>

        {/* HERO */}
        <section className="attraction-hero">
          {attraction.image && !imageError ? (
            <img
              src={attraction.image}
              alt={`${attraction.name}, ${attraction.destination}`}
              className="attraction-hero-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="attraction-hero-placeholder"
              aria-hidden="true"
            ></div>
          )}

          <div className="attraction-hero-overlay"></div>

          <div className="attraction-hero-content">
            <span className="attraction-hero-eyebrow">
              <span className="attraction-eyebrow-dot"></span>
              DISCOVER {attraction.destination?.toUpperCase()}
            </span>

            <span className="attraction-hero-category">
              {attraction.category}
            </span>

            <h1>{attraction.name}</h1>

            <p>
              <span>⌖</span> {attraction.destination}
            </p>
          </div>

          <div className="attraction-hero-bottom">
            <span>EXPLORE SOMETHING EXTRAORDINARY</span>
            <span>✦</span>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="attraction-content-layout">
          <div className="attraction-main-content">

            {/* ABOUT */}
            <section className="attraction-section">
              <span className="attraction-section-label">
                <span>01</span> ABOUT THIS PLACE
              </span>

              <h2>
                Discover the story of{" "}
                <span>{attraction.name}.</span>
              </h2>

              <p className="attraction-description">
                {attraction.description ||
                  `Explore ${attraction.name}, located in ${attraction.destination}.`}
              </p>
            </section>

            {/* HIGHLIGHTS */}
            {attraction.highlights?.length > 0 && (
              <section className="attraction-section">
                <span className="attraction-section-label">
                  <span>02</span> WHAT TO EXPERIENCE
                </span>

                <h2>
                  Make the most of{" "}
                  <span>your visit.</span>
                </h2>

                <div className="attraction-highlights-grid">
                  {attraction.highlights.map((highlight, index) => (
                    <div
                      className="attraction-highlight-card"
                      key={index}
                    >
                      <span className="attraction-highlight-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="attraction-highlight-icon">
                        ✦
                      </span>

                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* VISITOR INFORMATION */}
            <section className="attraction-section">
              <span className="attraction-section-label">
                <span>03</span> VISITOR INFORMATION
              </span>

              <h2>
                Before you{" "}
                <span>visit.</span>
              </h2>

              <div className="attraction-info-grid">
                <div className="attraction-info-card">
                  <span className="attraction-info-icon">◷</span>
                  <small>ESTIMATED VISIT</small>
                  <strong>{visitDuration}</strong>
                </div>

                <div className="attraction-info-card">
                  <span className="attraction-info-icon">◴</span>
                  <small>OPENING TIME</small>
                  <strong>
                    {attraction.openingTime || "Not available"}
                  </strong>
                </div>

                <div className="attraction-info-card">
                  <span className="attraction-info-icon">◷</span>
                  <small>CLOSING TIME</small>
                  <strong>
                    {attraction.closingTime || "Not available"}
                  </strong>
                </div>

                <div className="attraction-info-card">
                  <span className="attraction-info-icon">▦</span>
                  <small>CLOSED DAYS</small>
                  <strong>
                    {attraction.closedDays?.length
                      ? attraction.closedDays.join(", ")
                      : "Not specified"}
                  </strong>
                </div>
              </div>

              <p className="attraction-info-note">
                Visiting information may change. Check with the
                attraction before planning your visit.
              </p>
            </section>

            {/* TAGS */}
            {attraction.tags?.length > 0 && (
              <section className="attraction-section">
                <span className="attraction-section-label">
                  <span>04</span> EXPLORE YOUR INTERESTS
                </span>

                <h2>
                  What makes it{" "}
                  <span>special.</span>
                </h2>

                <div className="attraction-tags">
                  {attraction.tags.map((tag, index) => (
                    <span key={index}>
                      {tag.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* LOCATION */}
            <section className="attraction-section attraction-location-section">
              <span className="attraction-section-label">
                <span>05</span> FIND THIS PLACE
              </span>

              <h2>
                Find your{" "}
                <span>way.</span>
              </h2>

              {hasCoordinates ? (
                <>
                  <div className="attraction-coordinates">
                    <div>
                      <small>LATITUDE</small>
                      <strong>{attraction.latitude}</strong>
                    </div>

                    <div>
                      <small>LONGITUDE</small>
                      <strong>{attraction.longitude}</strong>
                    </div>
                  </div>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="attraction-map-link"
                  >
                    View on Google Maps
                    <span>↗</span>
                  </a>
                </>
              ) : (
                <p className="attraction-description">
                  Location coordinates are not available.
                </p>
              )}
            </section>

            {/* NEARBY HOTELS BANNER */}
            {hasCoordinates && (
              <section className="attraction-hotels-banner">
                <div className="attraction-hotels-banner-content">
                  <span className="attraction-hotel-eyebrow">
                    YOUR STAY, SORTED
                  </span>

                  <h2>
                    Stay close to the places{" "}
                    <span>you love.</span>
                  </h2>

                  <p>
                    Find hotels near {attraction.name} and explore
                    accommodation options around your selected
                    attraction.
                  </p>
                </div>

                {nearbyHotelsUrl && (
                  <Link
                    to={nearbyHotelsUrl}
                    className="attraction-hotels-banner-button"
                  >
                    Explore Nearby Hotels <span>→</span>
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="attraction-sidebar">
            <div className="attraction-sidebar-card">
              <span className="attraction-sidebar-icon">✧</span>

              <span className="attraction-sidebar-label">
                YOUR NEXT EXPERIENCE
              </span>

              <h3>Explore {attraction.destination}</h3>

              <p>
                Discover more places, local experiences and
                memorable attractions in {attraction.destination}.
              </p>

              <Link
                to={`/explore/${encodeURIComponent(attraction.destination)}`}
                className="attraction-sidebar-link"
              >
                Discover more places <span>→</span>
              </Link>
            </div>

            <div className="attraction-sidebar-tip">
              <span>TRAVEL TIP</span>
              <p>
                Allow enough time to explore the surroundings
                and enjoy your visit without rushing.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default AttractionDetails;
