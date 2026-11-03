import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TripMap.css";

const createNumberedIcon = (number) =>
  L.divIcon({
    className: "trip-map-number-icon",
    html: `<div class="trip-map-marker">${number}</div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });

const getCoordinates = (place) => {
  const lat = Number(place.lat ?? place.latitude);
  const lon = Number(
    place.lon ?? place.lng ?? place.longitude
  );

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180 ||
    (lat === 0 && lon === 0)
  ) {
    return null;
  }

  return [lat, lon];
};

const getPlaceName = (place) =>
  place.name ||
  place.title ||
  place.attractionName ||
  place.placeName ||
  "Planned attraction";

const getGoogleMapsUrl = (place) => {
  const coordinates = getCoordinates(place);

  if (coordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    getPlaceName(place)
  )}`;
};

function FitMapToMarkers({ places }) {
  const map = useMap();

  useEffect(() => {
    if (!places.length) return;

    const bounds = L.latLngBounds(
      places.map((place) => place.coordinates)
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [45, 45],
        maxZoom: 14,
      });
    }
  }, [map, places]);

  return null;
}

export default function TripMap({ generatedItinerary }) {
  const [selectedDay, setSelectedDay] = useState("all");

  const days = useMemo(() => {
    return Array.isArray(generatedItinerary?.days)
      ? generatedItinerary.days
      : [];
  }, [generatedItinerary]);

  const allPlaces = useMemo(() => {
    const result = [];
    const seen = new Set();

    days.forEach((day, dayIndex) => {
      const dayNumber = day.day ?? dayIndex + 1;

      let attractions = [];

      if (Array.isArray(day.schedule)) {
        attractions = day.schedule.filter(
          (item) => item.type === "attraction"
        );
      }

      if (
        attractions.length === 0 &&
        Array.isArray(day.attractions)
      ) {
        attractions = day.attractions;
      }

      attractions.forEach((place, placeIndex) => {
        const coordinates = getCoordinates(place);

        if (!coordinates) return;

        const name = getPlaceName(place);
        const key = `${dayNumber}-${name}-${coordinates.join(",")}`;

        if (seen.has(key)) return;
        seen.add(key);

        result.push({
          ...place,
          name,
          dayNumber,
          coordinates,
          markerNumber: result.length + 1,
          placeIndex: placeIndex + 1,
        });
      });
    });

    return result;
  }, [days]);

  const visiblePlaces = useMemo(() => {
    if (selectedDay === "all") return allPlaces;

    return allPlaces.filter(
      (place) => String(place.dayNumber) === selectedDay
    );
  }, [allPlaces, selectedDay]);

  const routePositions = useMemo(
    () => visiblePlaces.map((place) => place.coordinates),
    [visiblePlaces]
  );

  const defaultCenter = useMemo(() => {
    if (visiblePlaces.length > 0) {
      return visiblePlaces[0].coordinates;
    }

    if (allPlaces.length > 0) {
      return allPlaces[0].coordinates;
    }

    return [17.385, 78.4867];
  }, [visiblePlaces, allPlaces]);

  if (!generatedItinerary) {
    return (
      <section className="trip-map-card">
        <h2>Trip Map</h2>
        <p>
          No generated itinerary is available for this trip yet.
        </p>
      </section>
    );
  }

  return (
    <section className="trip-map-card">
      <div className="trip-map-header">
        <div>
          <h2>Trip Map</h2>
          <p className="trip-map-description">
            Explore the locations included in your itinerary.
          </p>
        </div>

        <div className="trip-map-filter">
          <label htmlFor="trip-map-day-filter">
            Show locations:
          </label>

          <select
            id="trip-map-day-filter"
            value={selectedDay}
            onChange={(event) =>
              setSelectedDay(event.target.value)
            }
          >
            <option value="all">All days</option>

            {days.map((day, index) => {
              const dayNumber = day.day ?? index + 1;

              return (
                <option
                  key={`${dayNumber}-${day.date || index}`}
                  value={String(dayNumber)}
                >
                  Day {dayNumber}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {visiblePlaces.length > 0 ? (
        <>
          <div className="trip-map-container">
            <MapContainer
              center={defaultCenter}
              zoom={12}
              scrollWheelZoom={true}
              className="trip-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitMapToMarkers places={visiblePlaces} />

              {visiblePlaces.length > 1 && (
                <Polyline
                  positions={routePositions}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 3,
                    opacity: 0.7,
                    dashArray: "7 7",
                  }}
                />
              )}

              {visiblePlaces.map((place) => (
                <Marker
                  key={`${place.dayNumber}-${place.name}-${place.coordinates.join(",")}`}
                  position={place.coordinates}
                  icon={createNumberedIcon(place.markerNumber)}
                >
                  <Popup>
                    <div className="trip-map-popup">
                      <strong>
                        {place.markerNumber}. {place.name}
                      </strong>

                      <p>
                        Day {place.dayNumber}
                        {place.category
                          ? ` · ${place.category}`
                          : ""}
                      </p>

                      {place.startTime && (
                        <p>
                          <strong>Start:</strong>{" "}
                          {place.startTime}
                        </p>
                      )}

                      {place.endTime && (
                        <p>
                          <strong>End:</strong>{" "}
                          {place.endTime}
                        </p>
                      )}

                      <a
                        href={getGoogleMapsUrl(place)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get directions ↗
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <p className="trip-map-note">
            Map data © OpenStreetMap contributors. Location
            markers use coordinates stored in your itinerary.
            The dotted line connects your planned locations; it
            does not represent a verified road route.
          </p>

          <div className="trip-map-place-list">
            {visiblePlaces.map((place) => (
              <article
                className="trip-map-place-card"
                key={`${place.dayNumber}-${place.name}-${place.coordinates.join(",")}`}
              >
                <div className="trip-map-place-number">
                  {place.markerNumber}
                </div>

                <div className="trip-map-place-details">
                  <h3>{place.name}</h3>

                  <p>
                    Day {place.dayNumber}
                    {place.category
                      ? ` · ${place.category}`
                      : " · Attraction"}
                  </p>

                  {place.startTime && (
                    <p>Start time: {place.startTime}</p>
                  )}
                </div>

                <a
                  className="trip-map-directions"
                  href={getGoogleMapsUrl(place)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions ↗
                </a>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="trip-map-empty">
          <h3>No map coordinates available</h3>
          <p>
            The itinerary does not contain valid latitude and
            longitude values for the selected day. The map
            needs coordinates to place attraction markers.
          </p>
        </div>
      )}
    </section>
  );
}