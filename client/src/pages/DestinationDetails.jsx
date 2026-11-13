import { apiUrl } from "../config/api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./DestinationDetails.css";

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attractionsLoading, setAttractionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [attractionsError, setAttractionsError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDestination() {
      try {
        setLoading(true);
        setError("");
        setDestination(null);
        setImageError(false);

        const response = await fetch(
          apiUrl(`/api/destinations/${id}`)
        );

        if (!response.ok) {
          throw new Error("Destination not found");
        }

        const data = await response.json();

        if (!cancelled) {
          setDestination(data);
        }
      } catch (err) {
        console.error("Destination error:", err);

        if (!cancelled) {
          setError("Unable to load this destination.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDestination();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAttractions() {
      try {
        setAttractionsLoading(true);
        setAttractionsError("");

        const response = await fetch(
          apiUrl("/api/activities")
        );

        if (!response.ok) {
          throw new Error("Unable to load attractions.");
        }

        const data = await response.json();

        if (!cancelled) {
          setAttractions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Attractions error:", err);

        if (!cancelled) {
          setAttractionsError(
            "Unable to load attractions. Please try again later."
          );
        }
      } finally {
        if (!cancelled) {
          setAttractionsLoading(false);
        }
      }
    }

    fetchAttractions();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="destination-page-state">
        <div className="details-spinner"></div>
        <p>Discovering your destination...</p>
      </main>
    );
  }

  if (error || !destination) {
    return (
      <main className="destination-page-state">
        <div className="details-error-icon">✧</div>
        <span className="details-section-label">LET'S TRY AGAIN</span>
        <h2>Destination unavailable</h2>
        <p>{error || "We couldn't find this destination."}</p>
        <Link to="/" className="details-back-button">
          ← Back to Explore
        </Link>
      </main>
    );
  }

  const travelInfo = destination.travelInfo || {};

  const hasCoordinates =
    destination.latitude != null &&
    destination.longitude != null;

  const destinationAttractions = attractions.filter(
    (attraction) =>
      attraction.destination?.trim().toLowerCase() ===
      destination.name?.trim().toLowerCase()
  );

  return (
    <main className="destination-details-page">
      <div className="destination-top-navigation">
        <Link to="/" className="destination-back-link">
          <span>←</span> Back to Explore
        </Link>

        <span className="destination-page-caption">
          YOUR TRAVEL JOURNAL
        </span>
      </div>

      {/* HERO */}
      <section className="destination-hero">
        {destination.image && !imageError ? (
          <img
            src={destination.image}
            alt={destination.name}
            className="destination-hero-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="destination-hero-placeholder">
            <span>DISCOVER {destination.name?.toUpperCase()}</span>
          </div>
        )}

        <div className="destination-hero-overlay"></div>

        <div className="destination-hero-content">
          <span className="destination-hero-eyebrow">
            <span className="destination-eyebrow-dot"></span>
            YOUR NEXT ADVENTURE
          </span>

          {destination.tags?.length > 0 && (
            <div className="hero-tags">
              {destination.tags.slice(0, 3).map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <h1>{destination.name}</h1>

          <p className="destination-hero-country">
            <span>⌖</span> {destination.country}
          </p>
        </div>

        <div className="destination-hero-bottom">
          <span>DISCOVER SOMETHING EXTRAORDINARY</span>
          <span className="destination-hero-star">✦</span>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="destination-content-layout">
        <div className="destination-main-content">
          {/* ABOUT */}
          <section className="details-section">
            <span className="details-section-label">
              <span>01</span> THE DESTINATION
            </span>

            <h2>
              Discover{" "}
              <span className="details-heading-accent">
                {destination.name}
              </span>
            </h2>

            <p className="destination-long-description">
              {destination.about ||
                destination.description ||
                "Discover this amazing destination and create unforgettable memories."}
            </p>

            {destination.description && destination.about && (
              <div className="destination-highlight">
                <span className="destination-highlight-icon">✦</span>
                <p>{destination.description}</p>
              </div>
            )}
          </section>

          {/* HISTORY */}
          {destination.history && (
            <section className="details-section">
              <span className="details-section-label">
                <span>02</span> THE PAST
              </span>

              <h2>
                A story worth{" "}
                <span className="details-heading-accent">
                  discovering.
                </span>
              </h2>

              <p className="destination-long-description">
                {destination.history}
              </p>
            </section>
          )}

          {/* CULTURE */}
          {destination.culture && (
            <section className="details-section">
              <span className="details-section-label">
                <span>03</span> LOCAL CULTURE
              </span>

              <h2>
                Feel the local{" "}
                <span className="details-heading-accent">
                  spirit.
                </span>
              </h2>

              <p className="destination-long-description">
                {destination.culture}
              </p>
            </section>
          )}

          {/* LOCAL FOOD */}
          {destination.food?.length > 0 && (
            <section className="details-section">
              <span className="details-section-label">
                <span>04</span> LOCAL CUISINE
              </span>

              <h2>
                A taste of{" "}
                <span className="details-heading-accent">
                  {destination.name}.
                </span>
              </h2>

              <p className="details-section-description">
                Discover some of the food this destination is known for.
              </p>

              <div className="destination-food-grid">
                {destination.food.map((item, index) => (
                  <div className="destination-food-card" key={item}>
                    <span className="destination-food-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="destination-food-icon">✦</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCES */}
          {destination.experiences?.length > 0 && (
            <section className="details-section">
              <span className="details-section-label">
                <span>05</span> EXPERIENCES
              </span>

              <h2>
                Things to{" "}
                <span className="details-heading-accent">
                  explore.
                </span>
              </h2>

              <p className="details-section-description">
                Make your journey memorable with these experiences.
              </p>

              <div className="details-tags">
                {destination.experiences.map((item, index) => (
                  <div className="details-tag" key={item}>
                    <span className="details-tag-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{item}</strong>
                    <span className="details-tag-arrow">↗</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TRAVEL INFORMATION */}
          {(travelInfo.bestTimeToVisit ||
            travelInfo.idealDuration ||
            travelInfo.knownFor?.length > 0) && (
            <section className="details-section">
              <span className="details-section-label">
                <span>06</span> PLAN YOUR VISIT
              </span>

              <h2>
                Before you{" "}
                <span className="details-heading-accent">go.</span>
              </h2>

              <div className="destination-travel-grid">
                {travelInfo.bestTimeToVisit && (
                  <div className="destination-travel-card">
                    <span>BEST TIME TO VISIT</span>
                    <strong>{travelInfo.bestTimeToVisit}</strong>
                    <small>Recommended travel season</small>
                  </div>
                )}

                {travelInfo.idealDuration && (
                  <div className="destination-travel-card">
                    <span>IDEAL DURATION</span>
                    <strong>{travelInfo.idealDuration}</strong>
                    <small>Suggested trip length</small>
                  </div>
                )}
              </div>

              {travelInfo.knownFor?.length > 0 && (
                <div className="destination-known-for">
                  <h3>What makes it special</h3>

                  <div className="destination-known-tags">
                    {travelInfo.knownFor.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ATTRACTIONS */}
          <section className="details-section destination-attractions-section">
            <span className="details-section-label">
              <span>07</span> PLACES TO EXPLORE
            </span>

            <div className="attractions-editorial-heading">
              <div>
                <h2>
                  Find your next{" "}
                  <span className="details-heading-accent">
                    favourite place.
                  </span>
                </h2>

                <p className="details-section-description">
                  From iconic landmarks to hidden treasures, discover
                  the places that make {destination.name} special.
                </p>
              </div>

              <span className="attractions-count">
                {String(destinationAttractions.length).padStart(2, "0")}
                <small>PLACES</small>
              </span>
            </div>

            {attractionsLoading ? (
              <p className="attractions-loading">
                Loading attractions...
              </p>
            ) : attractionsError ? (
              <p className="attractions-error">
                {attractionsError}
              </p>
            ) : destinationAttractions.length > 0 ? (
              <div className="destination-attractions-grid">
                {destinationAttractions.map((attraction, index) => (
                  <button
                    type="button"
                    className="destination-attraction-card"
                    key={attraction.id}
                    onClick={() =>
                      navigate(`/activities/${attraction.id}`)
                    }
                  >
                    <div className="destination-attraction-image">
                      {attraction.image ? (
                        <img
                          src={attraction.image}
                          alt={attraction.name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="attraction-image-fallback">
                          <span>{attraction.name}</span>
                        </div>
                      )}

                      <div className="attraction-image-overlay"></div>

                      <span className="destination-attraction-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="destination-attraction-category">
                        {attraction.category}
                      </span>

                      <span className="attraction-image-arrow">↗</span>
                    </div>

                    <div className="destination-attraction-content">
                      <h3>{attraction.name}</h3>
                      <p>{attraction.description}</p>

                      <span className="destination-attraction-link">
                        Explore this place <span>→</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="attractions-empty">
                Attractions for this destination are coming soon.
              </p>
            )}
          </section>

          {/* LOCATION */}
          <section className="details-section details-location-section">
            <span className="details-section-label">
              <span>08</span> LOCATION
            </span>

            <h2>Find your way</h2>

            <p className="details-section-description">
              Keep the destination coordinates handy when planning
              your visit.
            </p>

            <div className="coordinates">
              <div className="coordinate-card">
                <div className="coordinate-card-top">
                  <span className="coordinate-symbol">↕</span>
                  <span>LATITUDE</span>
                </div>

                <strong>
                  {destination.latitude ?? "Not available"}
                </strong>
              </div>

              <div className="coordinate-card">
                <div className="coordinate-card-top">
                  <span className="coordinate-symbol">↔</span>
                  <span>LONGITUDE</span>
                </div>

                <strong>
                  {destination.longitude ?? "Not available"}
                </strong>
              </div>
            </div>

            {hasCoordinates && (
              <a
                className="destination-map-link"
                href={`https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                View location on Google Maps
                <span>↗</span>
              </a>
            )}
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="destination-sidebar">
          <div className="travel-tip-card">
            <div className="travel-tip-icon">✧</div>

            <div>
              <strong>A little travel inspiration</strong>
              <p>
                Discover the destination, explore its attractions,
                and experience everything it has to offer.
              </p>
            </div>
          </div>

          <Link to="/" className="sidebar-explore-link">
            <span>←</span> Discover more destinations
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default DestinationDetails;