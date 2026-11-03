import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./DestinationDetails.css";

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    setDestination(null);

    fetch(`http://localhost:5000/api/destinations/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Destination not found");
        }

        return response.json();
      })
      .then((data) => {
        if (!cancelled) {
          setDestination(data);
        }
      })
      .catch((error) => {
        console.error(error);

        if (!cancelled) {
          setError("Unable to load this destination.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleFindHotels() {
    if (
      !destination ||
      destination.latitude == null ||
      destination.longitude == null
    ) {
      return;
    }

    navigate(
      `/hotels?latitude=${destination.latitude}&longitude=${destination.longitude}&destinationId=${destination._id}`
    );
  }

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
        <div className="details-error-icon">🌍</div>

        <span className="details-section-label">
          LET'S TRY AGAIN
        </span>

        <h2>Destination unavailable</h2>

        <p>
          {error || "We couldn't find this destination."}
        </p>

        <Link to="/" className="details-back-button">
          ← Back to Explore
        </Link>
      </main>
    );
  }

  const hasCoordinates =
    destination.latitude != null &&
    destination.longitude != null;

  return (
    <main className="destination-details-page">
      <Link to="/" className="destination-back-link">
        <span>←</span> Back to Explore
      </Link>

      <section className="destination-hero">
        {destination.image ? (
          <img
            src={destination.image}
            alt={destination.name}
            className="destination-hero-image"
          />
        ) : (
          <div className="destination-hero-placeholder">
            <span>🌍</span>
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

      <div className="destination-content-layout">
        <div className="destination-main-content">
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
              {destination.description ||
                "Discover this amazing destination and create unforgettable memories."}
            </p>

            <div className="destination-highlight">
              <span className="destination-highlight-icon">✦</span>

              <p>
                Every destination has a story. Start exploring,
                find places that inspire you, and create a trip
                that is uniquely yours.
              </p>
            </div>
          </section>

          {destination.tags?.length > 0 && (
            <section className="details-section">
              <span className="details-section-label">
                <span>02</span> EXPERIENCES
              </span>

              <h2>Things to explore</h2>

              <p className="details-section-description">
                Discover what makes this destination special.
              </p>

              <div className="details-tags">
                {destination.tags.map((tag, index) => (
                  <div className="details-tag" key={tag}>
                    <span className="details-tag-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <strong>{tag}</strong>

                    <span className="details-tag-arrow">↗</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="details-section details-location-section">
            <span className="details-section-label">
              <span>03</span> LOCATION
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

        <aside className="destination-sidebar">
          <div className="plan-card">
            <div className="plan-card-top">
              <div className="plan-icon">✈</div>

              <span className="plan-card-label">
                YOUR JOURNEY
              </span>
            </div>

            <h3>
              Your next great trip starts here.
            </h3>

            <p>
              Turn inspiration into a travel plan. Organize your
              trips and keep your adventures in one place.
            </p>

            <Link to="/trips" className="plan-button">
              <span>Plan a Trip</span>
              <span className="plan-button-arrow">→</span>
            </Link>

            <div className="plan-card-footer">
              <span>✦</span>
              YOUR NEXT CHAPTER AWAITS
            </div>
          </div>

          {hasCoordinates && (
            <div className="hotel-discovery-card">
              <div className="hotel-discovery-icon">⌂</div>

              <span className="hotel-discovery-label">
                NEARBY STAYS
              </span>

              <h3>Find your home away from home.</h3>

              <p>
                Explore hotel options around this destination
                and find a convenient place to stay.
              </p>

              <button
                type="button"
                className="hotel-discovery-button"
                onClick={handleFindHotels}
              >
                <span>Find Nearby Hotels</span>
                <span>→</span>
              </button>
            </div>
          )}

          <div className="travel-tip-card">
            <div className="travel-tip-icon">✧</div>

            <div>
              <strong>A little travel inspiration</strong>

              <p>
                Explore the destination, check nearby stays,
                and add trip planning to your next adventure.
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