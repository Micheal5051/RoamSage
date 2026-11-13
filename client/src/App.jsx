import { apiUrl } from "./config/api";

import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import RegionCards from "./components/RegionCards";
import UniversalSearch from "./components/UniversalSearch";

import DestinationDetails from "./pages/DestinationDetails";
import ExploreDestinations from "./pages/ExploreDestinations";
import AttractionDetails from "./pages/AttractionDetails";
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
import AIChat from "./pages/AIChat";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";

import { AuthProvider } from "./context/AuthContext";

import "./App.css";

function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDestinations = async () => {
      try {
        const response = await fetch(
          apiUrl("/api/destinations"),
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load destinations");
        }

        const data = await response.json();
        setDestinations(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Destination fetch error:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDestinations();

    return () => controller.abort();
  }, []);

  const handleRegionDestinationSelect = (destination) => {
    if (!destination?.trim()) return;

    navigate(`/explore/${encodeURIComponent(destination.trim())}`);
  };

  return (
    <main>
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-eyebrow">
              YOUR NEXT ADVENTURE STARTS HERE
            </span>

            <h1>
              EXPLORE
              <br />
              THE WORLD.
            </h1>

            <p>
              Discover extraordinary places and create unforgettable
              travel experiences.
            </p>

            <UniversalSearch
              destinations={destinations}
              onDestinationSelect={handleRegionDestinationSelect}
            />

            {!loading && destinations.length === 0 && (
              <p className="search-error">
                Destinations are temporarily unavailable.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="intro-content">
          <span className="section-eyebrow">
            TRAVEL BEYOND THE ORDINARY
          </span>

          <h2>Not just places. Experiences.</h2>

          <p>
            Every destination has a story waiting to be discovered.
            Find the places that inspire you, explore new cultures,
            and make memories that last a lifetime.
          </p>
        </div>
      </section>

      <RegionCards
        onDestinationSelect={handleRegionDestinationSelect}
      />

      <section className="closing-section">
        <div className="closing-content">
          <span className="section-eyebrow">
            THE WORLD IS WAITING
          </span>

          <h2>Your journey begins with a destination.</h2>

          <p>
            Find your next escape and let every journey become
            a story worth remembering.
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("regions")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore regions â†—
          </button>
        </div>
      </section>
    </main>
  );
}

function AppContent() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/explore/:place"
          element={<ExploreDestinations />}
        />

        <Route
          path="/destinations/:id"
          element={<DestinationDetails />}
        />

        <Route
          path="/activities/:id"
          element={<AttractionDetails />}
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

        <Route path="/profile" element={<Profile />} />

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

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route
          path="/ai-assistant"
          element={<AIChat />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

