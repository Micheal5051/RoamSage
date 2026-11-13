
import { useEffect, useState } from "react";
import "./RegionCards.css";

const regions = [
  {
    id: "north",
    name: "North India",
    subtitle: "Mountains, heritage & timeless beauty",
    photos: [
      "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=85",
    ],
    destinations: [
      "Kashmir",
      "Ladakh",
      "Manali",
      "Shimla",
      "Jaipur",
      "Agra",
      "Delhi",
      "Varanasi",
    ],
  },
  {
    id: "south",
    name: "South India",
    subtitle: "Green escapes, beaches & culture",
    photos: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85",
    ],
    destinations: [
      "Kerala",
      "Munnar",
      "Ooty",
      "Mysuru",
      "Hampi",
      "Hyderabad",
      "Chennai",
      "Coorg",
    ],
  },
  {
    id: "east",
    name: "East India",
    subtitle: "Tea gardens, ancient temples & natural wonders",
    photos: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=85",
    ],
    destinations: [
      "Kolkata",
      "Darjeeling",
      "Puri",
      "Bhubaneswar",
      "Konark",
      "Sundarbans",
      "Bodh Gaya",
      "Ranchi",
    ],
  },
  {
    id: "west",
    name: "West India",
    subtitle: "Desert adventures, royal cities & coastal escapes",
    photos: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
    ],
    destinations: [
      "Goa",
      "Mumbai",
      "Udaipur",
      "Jaisalmer",
      "Ahmedabad",
      "Rann of Kutch",
      "Pune",
      "Lonavala",
    ],
  },
];

function RegionCard({ region, onDestinationSelect }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhoto(
        (previous) => (previous + 1) % region.photos.length
      );
      setImageError(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [region.photos.length]);

  const handleDestinationClick = (event, destination) => {
    event.stopPropagation();

    if (onDestinationSelect) {
      onDestinationSelect(destination);
    }
  };

  return (
    <div
      className={`region-card ${flipped ? "is-flipped" : ""}`}
      onClick={() => setFlipped((previous) => !previous)}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          setFlipped((previous) => !previous);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${region.name}. ${
        flipped ? "Show photos" : "Explore destinations"
      }`}
      aria-pressed={flipped}
    >
      <div className="region-card-inner">
        {/* FRONT SIDE */}
        <div className="region-card-front">
          {!imageError ? (
            <img
              key={region.photos[currentPhoto]}
              src={region.photos[currentPhoto]}
              alt={`${region.name} travel scenery`}
              className="region-card-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="region-image-fallback">
              <span>{region.name}</span>
              <small>Discover incredible places</small>
            </div>
          )}

          <div className="region-card-overlay">
            <span className="region-eyebrow">
              DISCOVER INDIA
            </span>

            <h3>{region.name}</h3>

            <p>{region.subtitle}</p>

            <span className="region-explore">
              Explore destinations <span>↗</span>
            </span>
          </div>

          <div className="region-photo-indicators">
            {region.photos.map((photo, index) => (
              <span
                key={photo}
                className={index === currentPhoto ? "active" : ""}
              />
            ))}
          </div>
        </div>

        {/* BACK SIDE */}
        <div className="region-card-back">
          <span className="region-eyebrow">
            EXPLORE THE REGION
          </span>

          <h3>{region.name}</h3>

          <p>Popular destinations</p>

          <div className="region-destinations">
            {region.destinations.map((destination, index) => (
              <button
                type="button"
                key={destination}
                onClick={(event) =>
                  handleDestinationClick(event, destination)
                }
                aria-label={`Find ${destination} in destinations`}
              >
                <small>
                  {String(index + 1).padStart(2, "0")}
                </small>

                {destination}

                <span className="region-destination-arrow">
                  ↗
                </span>
              </button>
            ))}
          </div>

          <span className="region-back-hint">
            Click to see photos ↗
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RegionCards({ onDestinationSelect }) {
  return (
    <section className="regions-section" id="regions">
      <div className="regions-heading">
        <span className="section-eyebrow">
          A LAND OF MANY STORIES
        </span>

        <h2>Explore India by region.</h2>

        <p>
          From the mighty Himalayas to the peaceful southern coast,
          discover the beauty of every corner.
        </p>
      </div>

      <div className="regions-grid">
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            onDestinationSelect={onDestinationSelect}
          />
        ))}
      </div>
    </section>
  );
}
