import { apiUrl } from "../config/api";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const API_URL = apiUrl("/api/auth");

const avatars = [
  "pineapple",
  "strawberry",
  "avocado",
  "watermelon",
  "banana",
  "orange",
  "grapes",
  "peach",
  "kiwi",
  "lemon",
  "apple",
  "mango",
  "blueberry",
  "cherries",
  "coconut"
];

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  avatar: "pineapple",
  country: "",
  city: "",
  bio: ""
};

function formatProfile(user) {
  return {
    ...initialProfile,
    ...user,
    avatar: user.avatar || "pineapple",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : ""
  };
}

function Profile() {
  const navigate = useNavigate();

  const { token, logout, updateUser } = useAuth();

  const [profile, setProfile] = useState(initialProfile);
  const [originalProfile, setOriginalProfile] = useState(initialProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // FETCH PROFILE FROM MONGODB
  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            logout();
            navigate("/login");
            return;
          }

          throw new Error(data.message || "Unable to load profile");
        }

        if (cancelled) return;

        const formatted = formatProfile(data.user);

        setProfile(formatted);
        setOriginalProfile(formatted);

      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (token) {
      fetchProfile();
    } else {
      navigate("/login");
    }

    return () => {
      cancelled = true;
    };
  }, [token, navigate, logout]);

  // HANDLE INPUT CHANGES
  function handleChange(event) {
    const { name, value } = event.target;

    setProfile(previous => ({
      ...previous,
      [name]: value
    }));
  }

  // SELECT FRUIT AVATAR
  function handleAvatarSelect(avatar) {
    if (!editing) return;

    setProfile(previous => ({
      ...previous,
      avatar
    }));

    setError("");
  }

  // CANCEL EDITING
  function handleCancel() {
    setProfile(originalProfile);
    setEditing(false);
    setError("");
    setSuccess("");
  }

  // SAVE PROFILE
  async function handleSave(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile");
      }

      const formatted = formatProfile(data.user);

      setProfile(formatted);
      setOriginalProfile(formatted);

      // UPDATE SHARED USER STATE
      updateUser({
        id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        avatar: data.user.avatar || "pineapple"
      });

      setEditing(false);
      setSuccess("Your profile has been updated successfully!");

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // LOGOUT
  function handleLogout() {
    logout();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">

        {/* PAGE HEADING */}
        <div className="profile-heading">
          <span>YOUR ACCOUNT</span>
          <h1>My Profile</h1>
          <p>
            Manage your personal information and travel identity.
          </p>
        </div>

        {/* ALERT MESSAGES */}
        {error && (
          <div className="profile-alert profile-error">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert profile-success">
            {success}
          </div>
        )}

        {/* PROFILE HEADER */}
        <section className="profile-header-card">

          <div className="profile-avatar">
            <img
              src={`/fruit-avatars/${profile.avatar}.png`}
              alt={`${profile.avatar} avatar`}
              onError={event => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="profile-header-info">
            <h2>{profile.name || "Your Name"}</h2>
            <p>{profile.email}</p>

            <span className="profile-member-label">
              TRAVEL EXPLORER MEMBER
            </span>
          </div>

          <button
            type="button"
            className="profile-edit-button"
            onClick={() => {
              if (editing) {
                handleCancel();
              } else {
                setEditing(true);
                setError("");
                setSuccess("");
              }
            }}
          >
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>

        </section>

        <form onSubmit={handleSave}>

          {/* FRUIT AVATAR SELECTION */}
          <section className="profile-details-card">

            <div className="profile-section-heading">
              <div>
                <span>YOUR TRAVEL BUDDY</span>
                <h2>Choose Your Avatar 🍓</h2>

                <p className="profile-avatar-description">
                  Pick a cute fruit character to represent you.
                </p>
              </div>
            </div>

            <div className="fruit-avatar-grid">

              {avatars.map(avatar => (
                <button
                  key={avatar}
                  type="button"
                  className={`fruit-avatar-option ${
                    profile.avatar === avatar ? "selected" : ""
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                  disabled={!editing}
                  title={avatar}
                  aria-label={`Select ${avatar} avatar`}
                  aria-pressed={profile.avatar === avatar}
                >
                  <img
                    src={`/fruit-avatars/${avatar}.png`}
                    alt={`${avatar} avatar`}
                  />

                  {profile.avatar === avatar && (
                    <span className="fruit-avatar-check">
                      ✓
                    </span>
                  )}

                  <span className="fruit-avatar-name">
                    {avatar.charAt(0).toUpperCase() + avatar.slice(1)}
                  </span>
                </button>
              ))}

            </div>

            {!editing && (
              <p className="profile-avatar-hint">
                Click Edit Profile to change your avatar.
              </p>
            )}

          </section>

          {/* PERSONAL INFORMATION */}
          <section className="profile-details-card">

            <div className="profile-section-heading">
              <div>
                <span>PERSONAL INFORMATION</span>
                <h2>About You</h2>
              </div>
            </div>

            <div className="profile-form-grid">

              <div className="profile-field">
                <label htmlFor="profile-name">Full Name</label>

                <input
                  id="profile-name"
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email Address</label>

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">Phone Number</label>

                <input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  disabled={!editing}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-dob">Date of Birth</label>

                <input
                  id="profile-dob"
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-gender">Gender</label>

                <select
                  id="profile-gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  disabled={!editing}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="profile-field">
                <label htmlFor="profile-country">Country</label>

                <input
                  id="profile-country"
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-city">City</label>

                <input
                  id="profile-city"
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

            </div>

            {/* BIO */}
            <div className="profile-field profile-bio-field">
              <label htmlFor="profile-bio">About Me</label>

              <textarea
                id="profile-bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!editing}
                maxLength={300}
                rows={4}
                placeholder="Tell us a little about yourself..."
              />

              {editing && (
                <small>
                  {profile.bio.length}/300 characters
                </small>
              )}
            </div>

            {/* SAVE AND CANCEL */}
            {editing && (
              <div className="profile-form-actions">

                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}

          </section>

        </form>

        {/* TRAVEL MESSAGE */}
        <section className="profile-footer-card">
          <div>
            <h3>Your journeys, your memories.</h3>

            <p>
              Keep your profile updated for a better travel experience.
            </p>
          </div>

          <span>✦</span>
        </section>

        {/* ACCOUNT SETTINGS */}
        <section className="profile-account-settings">

          <div>
            <span>ACCOUNT SETTINGS</span>
            <h2>Manage Your Account</h2>

            <p>
              Finished exploring? You can safely sign out of your account.
            </p>
          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </section>

      </div>
    </main>
  );
}

export default Profile;
