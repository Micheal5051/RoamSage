
import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
    setProfileOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate("/");
  }

  const getLinkClass = ({ isActive }) =>
    isActive ? "navbar-link active" : "navbar-link";

  const avatarPath = `/fruit-avatars/${user?.avatar || "pineapple"}.png`;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" onClick={closeMenu}>
        <span className="navbar-logo-icon">R</span>
        <span>ROAMSAGE</span>
      </Link>

      <button
        type="button"
        className={`navbar-menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => {
          setMenuOpen(!menuOpen);
          setProfileOpen(false);
        }}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
      >
        <span></span><span></span><span></span>
      </button>

      <div className={`navbar-links ${menuOpen ? "show" : ""}`}>
        <NavLink to="/" end className={getLinkClass} onClick={closeMenu}>
          Explore
        </NavLink>

        <NavLink to="/trips" className={getLinkClass} onClick={closeMenu}>
          My Trips
        </NavLink>

        {isLoggedIn && (
          <NavLink to="/my-bookings" className={getLinkClass} onClick={closeMenu}>
            My Bookings
          </NavLink>
        )}

        <NavLink to="/itinerary" className={getLinkClass} onClick={closeMenu}>
          JourneyCraft
        </NavLink>

        <NavLink to="/recommendations" className={getLinkClass} onClick={closeMenu}>
          Recommendations
        </NavLink>

        <NavLink to="/ai-assistant" className={getLinkClass} onClick={closeMenu}>
          AI Assistant <span className="navbar-sparkle">✦</span>
        </NavLink>

        {isLoggedIn ? (
          <div className="navbar-profile-wrapper">
            <button
              type="button"
              className="navbar-profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              aria-label="Open account menu"
            >
              <img src={avatarPath} alt="Your avatar" className="navbar-fruit-avatar" />
              <span className="navbar-profile-name">
                {user?.name || "My Account"}
              </span>
              <span className={`navbar-profile-arrow ${profileOpen ? "rotated" : ""}`}>
                ▾
              </span>
            </button>

            {profileOpen && (
              <div className="navbar-profile-dropdown">
                <div className="navbar-profile-info">
                  <img
                    src={avatarPath}
                    alt="Your avatar"
                    className="navbar-fruit-avatar dropdown-fruit-avatar"
                  />
                  <div className="navbar-profile-user-details">
                    <strong>{user?.name || "User"}</strong>
                    <span>{user?.email || ""}</span>
                  </div>
                </div>

                <div className="navbar-dropdown-divider"></div>

                <button
                  type="button"
                  className="navbar-dropdown-item"
                  onClick={() => {
                    closeMenu();
                    navigate("/profile");
                  }}
                >
                  <span>👤</span>My Profile
                </button>

                <button
                  type="button"
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={handleLogout}
                >
                  <span>↪</span>Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/login" className="navbar-login-button" onClick={closeMenu}>
            Login <span>↗</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
