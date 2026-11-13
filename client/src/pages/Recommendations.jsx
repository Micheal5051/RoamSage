import { apiUrl } from "../config/api";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Recommendations.css";

const INTERESTS = [
  "History",
  "Architecture",
  "Culture",
  "Nature",
  "Adventure",
  "Beaches",
  "Food",
  "Art",
  "Wildlife",
  "Spirituality"
];

function ResultCard({ item, kind, onClick }) {
  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className="recommendation-card"
      role="link"
      tabIndex={0}
      aria-label={`View ${item.name} details`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer" }}
    >
      {item.image ? (
        <img
          className="recommendation-card-image"
          src={item.image}
          alt={item.name}
          loading="lazy"
        />
      ) : (
        <div
          className="recommendation-card-image recommendation-image-placeholder"
          aria-label="Image coming soon"
        >
          Image coming soon
        </div>
      )}

      <div className="recommendation-card-body">
        <div className="recommendation-card-topline">
          <span>
            {kind === "attraction"
              ? item.destination
              : item.country}
          </span>

          <strong>{item.score}% match</strong>
        </div>

        <h3>{item.name}</h3>

        <p>
          {item.description ||
            "Explore this destination and discover what makes it special."}
        </p>

        <div className="recommendation-tags">
          {(item.matchedInterests || []).map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function Recommendations() {
  const navigate = useNavigate();

  const [selected, setSelected] = useState([]);
  const [results, setResults] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch(
          apiUrl("/api/destinations")
        );

        if (!response.ok) {
          throw new Error("Unable to load destinations.");
        }

        const data = await response.json();

        setDestinations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Destination loading error:", err);
      }
    }

    fetchDestinations();
  }, []);

  function openDestination(item) {
    const destination = destinations.find(
      (place) =>
        place.name?.trim().toLowerCase() ===
        item.name?.trim().toLowerCase()
    );

    const destinationId = destination?._id || destination?.id;

    if (!destinationId) {
      setError(
        `Unable to open ${item.name}. Destination details could not be found.`
      );
      return;
    }

    navigate(`/destinations/${encodeURIComponent(destinationId)}`);
  }

  function openAttraction(item) {
    if (!item.id) {
      setError(
        `Unable to open ${item.name}. Attraction ID is missing.`
      );
      return;
    }

    navigate(`/activities/${encodeURIComponent(item.id)}`);
  }

  function toggleInterest(interest) {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );

    setResults(null);
    setError("");
  }

  async function findRecommendations(event) {
    event.preventDefault();

    if (!selected.length) {
      setError("Select at least one interest to continue.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await fetch(
        apiUrl("/api/recommendations"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            interests: selected.map((item) =>
              item.toLowerCase()
            )
          })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load recommendations."
        );
      }

      setResults(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recommendations-page">
      <section className="recommendations-hero">
        <span className="recommendations-eyebrow">
          DISCOVER YOUR KIND OF JOURNEY
        </span>

        <h1>
          Travel that matches <em>you.</em>
        </h1>

        <p>
          Choose what you love, and discover Indian destinations
          and attractions that fit your interests.
        </p>
      </section>

      <section className="recommendations-content">
        <form
          className="recommendations-picker"
          onSubmit={findRecommendations}
        >
          <h2>What interests you?</h2>

          <p>
            Pick one or more interests to personalize your recommendations.
          </p>

          <div className="recommendations-interest-list">
            {INTERESTS.map((interest) => (
              <button
                type="button"
                key={interest}
                className={`recommendations-interest ${
                  selected.includes(interest) ? "selected" : ""
                }`}
                onClick={() => toggleInterest(interest)}
                aria-pressed={selected.includes(interest)}
              >
                {interest}
              </button>
            ))}
          </div>

          <button
            className="recommendations-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Finding matches..."
              : "Find my recommendations →"}
          </button>

          {error && (
            <p className="recommendations-error" role="alert">
              {error}
            </p>
          )}
        </form>

        {results && (
          <div className="recommendations-results" aria-live="polite">
            <div className="recommendations-results-heading">
              <span className="recommendations-eyebrow">
                CURATED FOR YOUR INTERESTS
              </span>

              <h2>Your destination matches</h2>

              <p>
                Scores represent interest-based matches, not visitor ratings.
              </p>
            </div>

            {results.recommendations?.length ? (
              <div className="recommendations-grid">
                {results.recommendations.map((item) => (
                  <ResultCard
                    key={item.name}
                    item={item}
                    kind="destination"
                    onClick={() => openDestination(item)}
                  />
                ))}
              </div>
            ) : (
              <p className="recommendations-empty">
                No destination matches found. Try different interests.
              </p>
            )}

            <div className="recommendations-results-heading recommendations-attractions-heading">
              <h2>Attractions you may enjoy</h2>
            </div>

            {results.attractions?.length ? (
              <div className="recommendations-grid">
                {results.attractions.map((item) => (
                  <ResultCard
                    key={item.id || `${item.destination}-${item.name}`}
                    item={item}
                    kind="attraction"
                    onClick={() => openAttraction(item)}
                  />
                ))}
              </div>
            ) : (
              <p className="recommendations-empty">
                No attraction matches found for these interests.
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
