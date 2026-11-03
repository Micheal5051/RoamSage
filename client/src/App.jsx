
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import DestinationCard from "./components/DestinationCard";
import DestinationDetails from "./pages/DestinationDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyTrips from "./pages/MyTrips";
import TripDashboard from "./pages/TripDashboard";
import Hotels from "./pages/Hotels";
import HotelDetails from "./pages/HotelDetails";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import ItineraryGenerator from "./pages/ItineraryGenerator";

import Navbar from "./components/Navbar";

import "./App.css";

function Home() {
  const [destinations, setDestinations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/destinations")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }

        return response.json();
      })
      .then((data) => {
        setDestinations(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load destinations.");
        setLoading(false);
      });
  }, []);

  const filteredDestinations = destinations.filter(
    (destination) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        destination.name?.toLowerCase().includes(searchText) ||
        destination.country?.toLowerCase().includes(searchText) ||
        destination.description?.toLowerCase().includes(searchText) ||
        destination.tags?.some((tag) =>
          tag.toLowerCase().includes(searchText)
        );

      const matchesTag =
        selectedTag === "all" ||
        destination.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    }
  );

  return (
    <>
      <header className="header">
        <h1>Travel Companion 🌍</h1>
        <p>Discover places. Plan trips. Explore more.</p>
      </header>

      <main>
        <h2>Explore Destinations</h2>

        <input
          className="search-box"
          type="text"
          placeholder="Search destinations, countries, or interests..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={selectedTag === "all" ? "active" : ""}
            onClick={() => setSelectedTag("all")}
          >
            All
          </button>

          <button
            className={selectedTag === "beaches" ? "active" : ""}
            onClick={() => setSelectedTag("beaches")}
          >
            Beaches
          </button>

          <button
            className={selectedTag === "food" ? "active" : ""}
            onClick={() => setSelectedTag("food")}
          >
            Food
          </button>

          <button
            className={selectedTag === "culture" ? "active" : ""}
            onClick={() => setSelectedTag("culture")}
          >
            Culture
          </button>

          <button
            className={selectedTag === "history" ? "active" : ""}
            onClick={() => setSelectedTag("history")}
          >
            History
          </button>
        </div>

        {loading && <p>Loading destinations...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <>
            <p>
              Showing {filteredDestinations.length} destination
              {filteredDestinations.length !== 1 ? "s" : ""}
            </p>

            <div className="destination-list">
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination._id}
                  destination={destination}
                />
              ))}
            </div>

            {filteredDestinations.length === 0 && (
              <p>No destinations found.</p>
            )}
          </>
        )}
      </main>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/destinations/:id"
          element={<DestinationDetails />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/trips" element={<MyTrips />} />

        <Route
          path="/trips/:id"
          element={<TripDashboard />}
        />

        <Route path="/hotels" element={<Hotels />} />

        <Route
          path="/hotels/:id"
          element={<HotelDetails />}
        />

        <Route
          path="/hotels/:id/book"
          element={<Booking />}
        />

        <Route
          path="/bookings/:id"
          element={<BookingConfirmation />}
        />

        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        <Route
          path="/itinerary"
          element={<ItineraryGenerator />}
        />
      </Routes>
    </div>
  );
}

export default App;
