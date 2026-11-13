import { apiUrl } from "../config/api";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DestinationCard from "../components/DestinationCard";
import "./ExploreDestinations.css";

function normalizeName(value = "") {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function ExploreDestinations() {
  const { place } = useParams();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedPlace = decodeURIComponent(place || "");

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          apiUrl("/api/destinations")
        );

        if (!response.ok) {
          throw new Error("Unable to load destinations.");
        }

        const data = await response.json();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Explore destinations error:", err);
        setError("Unable to load destinations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const matchingDestinations = useMemo(() => {
    const searchName = normalizeName(selectedPlace);

    return destinations.filter(
      (destination) =>
        normalizeName(destination.name) === searchName
    );
  }, [destinations, selectedPlace]);

  return (
    <main className="explore-page">
      {/* Destination hero */}
      <section className="explore-hero">
        <div className="explore-hero-content">
          <span className="explore-eyebrow">
            DISCOVER INDIA
          </span>

          <h1>{selectedPlace}</h1>

          <span className="explore-hero-divider" />

          <p>
            Find your next experience and discover what makes
            this destination special.
          </p>

          <Link to="/" className="explore-back-link">
            <span aria-hidden="true">←</span>
            Back to homepage
          </Link>
        </div>
      </section>

      {/* Destination results */}
      <section className="explore-results">
        <div className="explore-results-heading">
          <div className="explore-heading-content">
            <span className="section-eyebrow">
              YOUR NEXT ADVENTURE
            </span>

            <h2>
              Explore <span>{selectedPlace}</span>
            </h2>

            <p>
              Discover the destination and start planning your journey.
            </p>
          </div>

          <Link to="/" className="explore-home-link">
            Explore other regions
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {loading ? (
          <div className="explore-message" role="status">
            <span className="explore-loader" />
            <p>Finding beautiful destinations...</p>
          </div>
        ) : error ? (
          <div className="explore-message explore-error" role="alert">
            <span className="explore-status-icon">!</span>
            <p>{error}</p>
          </div>
        ) : matchingDestinations.length > 0 ? (
          <div className="destination-grid">
            {matchingDestinations.map((destination) => (
              <DestinationCard
                key={destination._id}
                destination={destination}
              />
            ))}
          </div>
        ) : (
          <div className="explore-empty">
            <span className="explore-empty-icon">✦</span>

            <span className="explore-empty-eyebrow">
              MORE PLACES TO COME
            </span>

            <h3>{selectedPlace} is coming soon</h3>

            <p>
              We don't have a destination listing for this place yet.
              We're expanding our destination collection.
            </p>

            <Link to="/" className="explore-return-button">
              Explore other destinations
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ExploreDestinations;