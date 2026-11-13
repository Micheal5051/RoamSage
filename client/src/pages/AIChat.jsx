
import { useEffect, useRef, useState } from "react";
import { apiUrl } from "../config/api";
import "./AIChat.css";

const AI_API_URL = apiUrl("/api/ai/chat");

const initialMessage = {
  role: "assistant",
  text: "Hello! I'm your AI travel companion, ready to help you discover amazing destinations across India. Where would you like to go?"
};

const features = [
  {
    icon: "✧",
    title: "Trip Planning",
    description: "Plan trips by your budget, interests, and style.",
    prompt: "Help me plan a memorable 2-day trip to Hyderabad."
  },
  {
    icon: "✈",
    title: "Flights & Booking",
    description: "Get guidance on flights, travel timing, and preparation.",
    prompt: "Give me a checklist for planning and booking a trip within India."
  },
  {
    icon: "⌂",
    title: "Hotel Suggestions",
    description: "Find accommodation ideas based on your destination.",
    prompt: "Suggest good areas and hotels to stay in Hyderabad."
  }
];

const destinations = [
  {
    name: "Charminar",
    location: "Hyderabad, Telangana",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d1/Charminar-Pride_of_Hyderabad.jpg",
    prompt: "Help me plan a visit to Charminar in Hyderabad. Suggest nearby attractions, local food and estimated costs."
  },
  {
    name: "Baga Beach",
    location: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&q=85",
    prompt: "Help me plan a trip to Baga Beach in Goa. Suggest nearby places, activities, hotels and estimated costs."
  },
  {
    name: "Alleppey Backwaters",
    location: "Alappuzha, Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=700&q=85",
    prompt: "Plan a trip to Alleppey Backwaters in Kerala. Suggest houseboat experiences, nearby attractions, food and estimated costs."
  },
  {
    name: "Hawa Mahal",
    location: "Jaipur, Rajasthan",
    image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=700&q=85",
    prompt: "Help me plan a visit to Hawa Mahal in Jaipur. Suggest nearby attractions, local food and estimated travel costs."
  }
];

function AIChat() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, loading]);

  const sendMessage = async (event, selectedMessage) => {
    if (event) event.preventDefault();

    const userMessage = (selectedMessage || input).trim();

    if (!userMessage || loading) return;

    const history = messages
      .filter(
        (message) =>
          message.role === "user" ||
          message.role === "assistant"
      )
      .slice(-20)
      .map((message) => ({
        role: message.role,
        text: message.text
      }));

    setMessages((previous) => [
      ...previous,
      { role: "user", text: userMessage }
    ]);

    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage,
          history
        })
      });

      const data = await response.json();

      console.log("AI response:", data);
      console.log("RAG records retrieved:", data.retrieved_records);
      console.log(
        "Personalized recommendations:",
        data.personalized_recommendations
      );

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to get an AI response."
        );
      }

      const recommendationData =
        data.personalized_recommendations?.success === true
          ? data.personalized_recommendations
          : null;

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.answer || "I couldn't generate an answer.",
          recommendations: recommendationData
        }
      ]);

    } catch (err) {
      console.error("AI chat error:", err);

      setError(
        err.message ||
        "Unable to connect to the AI service. Please try again."
      );

    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([initialMessage]);
    setInput("");
    setError("");
  };

  const isNewChat = messages.length === 1;

  const getDestinationPrompt = (place) => {
    return `Tell me more about ${place.name}. Include its main attractions, best time to visit, and estimated travel costs.`;
  };

  const getAttractionPrompt = (place) => {
    return `Tell me more about ${place.name} in ${place.destination}. Explain its history, importance, things to see, and estimated visit duration.`;
  };

  return (
    <div className="ai2-page">
      <div className="ai2-background-glow"></div>

      <div className="ai2-shell">

        {/* Header */}
        <header className="ai2-header">
          <a href="/" className="ai2-logo">
            <span className="ai2-logo-mark">✧</span>
            <span>Travel Explorer</span>
          </a>

          <nav className="ai2-nav">
            <a href="/ai-assistant" className="ai2-nav-active">
              ✧ AI Assistant
            </a>
            <a href="/trips">▣ My Trips</a>
            <a href="/">⌕ Explore</a>
            <a href="/my-bookings">♡ Bookings</a>
          </nav>

          <div className="ai2-header-right">
            <span className="ai2-live">
              <span></span> Gemini AI
            </span>

            <button
              type="button"
              className="ai2-new-chat"
              onClick={clearChat}
              disabled={loading}
            >
              + New Chat
            </button>
          </div>
        </header>

        {/* Main dashboard */}
        <main className="ai2-dashboard">

          {/* Chat workspace */}
          <section className="ai2-chat-workspace">

            {isNewChat ? (
              <div className="ai2-welcome">
                <div className="ai2-orb-wrap">
                  <div className="ai2-orb">
                    <span>✧</span>
                  </div>
                </div>

                <span className="ai2-welcome-label">
                  YOUR PERSONAL TRAVEL COMPANION
                </span>

                <h1>
                  Your next adventure
                  <br />
                  starts <span>right here.</span>
                </h1>

                <p>
                  Discover destinations across India, plan
                  unforgettable trips, and explore amazing
                  places with your AI travel assistant.
                </p>
              </div>
            ) : (
              <div className="ai2-conversation-heading">
                <span>✧ YOUR TRAVEL CONVERSATION</span>
                <h1>Let's plan your next adventure.</h1>
              </div>
            )}

            {/* Feature cards */}
            {isNewChat && (
              <div className="ai2-feature-grid">
                {features.map((feature) => (
                  <button
                    type="button"
                    className="ai2-feature-card"
                    key={feature.title}
                    onClick={() => sendMessage(null, feature.prompt)}
                    disabled={loading}
                  >
                    <span className="ai2-feature-icon">
                      {feature.icon}
                    </span>

                    <strong>{feature.title}</strong>
                    <small>{feature.description}</small>
                    <span className="ai2-feature-arrow">↗</span>
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="ai2-conversation">
              <div className="ai2-messages">

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`ai2-message-row ${
                      message.role === "user"
                        ? "ai2-user-row"
                        : "ai2-assistant-row"
                    }`}
                  >
                    <div className="ai2-message-avatar">
                      {message.role === "user" ? "👤" : "✧"}
                    </div>

                    <div className="ai2-message-content">
                      <span>
                        {message.role === "user"
                          ? "YOU"
                          : "TRAVEL EXPLORER AI"}
                      </span>

                      <div className="ai2-message-bubble">
                        {message.text}
                      </div>

                      {/* Personalized recommendations */}
                      {message.role === "assistant" &&
                        message.recommendations && (
                          <div className="ai2-recommendation-panel">

                            <div className="ai2-recommendation-heading">
                              <span>✧ PERSONALIZED FOR YOU</span>
                              <h3>Recommended destinations</h3>
                              <p>
                                Based on your interests:{" "}
                                {message.recommendations.selectedInterests
                                  ?.join(", ")}
                              </p>
                            </div>

                            {message.recommendations.recommendations
                              ?.length > 0 && (
                              <div className="ai2-recommendation-grid">
                                {message.recommendations.recommendations.map(
                                  (place) => (
                                    <button
                                      type="button"
                                      className="ai2-recommendation-card"
                                      key={place.name}
                                      onClick={() =>
                                        sendMessage(
                                          null,
                                          getDestinationPrompt(place)
                                        )
                                      }
                                      disabled={loading}
                                    >
                                      {place.image ? (
                                        <img
                                          src={place.image}
                                          alt={place.name}
                                          loading="lazy"
                                          onError={(event) => {
                                            event.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      ) : (
                                        <div className="ai2-recommendation-placeholder">
                                          ✧
                                        </div>
                                      )}

                                      <div className="ai2-recommendation-info">
                                        <strong>{place.name}</strong>

                                        <span>
                                          {place.matchedInterests?.join(" · ")}
                                        </span>

                                        <small>
                                          Relevance: {place.score}%
                                        </small>
                                      </div>

                                      <span className="ai2-recommendation-arrow">
                                        ↗
                                      </span>
                                    </button>
                                  )
                                )}
                              </div>
                            )}

                            {message.recommendations.attractions
                              ?.length > 0 && (
                              <>
                                <div className="ai2-recommendation-subheading">
                                  <h3>Attractions to explore</h3>
                                  <span>
                                    {message.recommendations.attractions.length}{" "}
                                    places
                                  </span>
                                </div>

                                <div className="ai2-attraction-list">
                                  {message.recommendations.attractions.map(
                                    (place) => (
                                      <button
                                        type="button"
                                        className="ai2-attraction-card"
                                        key={place.id || place.name}
                                        onClick={() =>
                                          sendMessage(
                                            null,
                                            getAttractionPrompt(place)
                                          )
                                        }
                                        disabled={loading}
                                      >
                                        {place.image ? (
                                          <img
                                            src={place.image}
                                            alt={place.name}
                                            loading="lazy"
                                            onError={(event) => {
                                              event.currentTarget.style.display =
                                                "none";
                                            }}
                                          />
                                        ) : (
                                          <div className="ai2-attraction-placeholder">
                                            ✧
                                          </div>
                                        )}

                                        <div className="ai2-attraction-info">
                                          <strong>{place.name}</strong>
                                          <span>{place.destination}</span>
                                          <small>
                                            {place.category || "Attraction"} ·{" "}
                                            {place.score}% relevance
                                          </small>
                                        </div>

                                        <span className="ai2-recommendation-arrow">
                                          ↗
                                        </span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </>
                            )}

                            <p className="ai2-recommendation-note">
                              Relevance scores show how closely each place
                              matches your interests. They are not ratings
                              or probabilities.
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="ai2-message-row ai2-assistant-row">
                    <div className="ai2-message-avatar">✧</div>

                    <div className="ai2-message-content">
                      <span>TRAVEL EXPLORER AI</span>

                      <div className="ai2-message-bubble ai2-loading">
                        Thinking
                        <i></i><i></i><i></i>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message input */}
            <form
              className="ai2-composer"
              onSubmit={sendMessage}
            >
              <div className="ai2-composer-top">
                <span>✧</span>

                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask anything about your next adventure..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="ai2-composer-bottom">
                <span className="ai2-composer-hint">
                  ✨ Powered by Gemini
                </span>

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </form>

            {error && (
              <div className="ai2-error">
                {error}
              </div>
            )}

            <p className="ai2-disclaimer">
              AI-generated travel suggestions may need verification.
            </p>

          </section>

          {/* Discovery panel */}
          <aside className="ai2-discovery">

            <div className="ai2-section-heading">
              <div>
                <span className="ai2-section-kicker">
                  DISCOVER INDIA
                </span>

                <h2>For You <span>✧</span></h2>
              </div>

              <a href="/">Explore ↗</a>
            </div>

            <div className="ai2-destination-grid">
              {destinations.slice(0, 2).map((place) => (
                <button
                  type="button"
                  className="ai2-destination-card"
                  key={place.name}
                  onClick={() => sendMessage(null, place.prompt)}
                  disabled={loading}
                >
                  <img src={place.image} alt={place.name} />

                  <span className="ai2-place-tag">
                    ✧ DESTINATION
                  </span>

                  <div className="ai2-place-info">
                    <strong>{place.name}</strong>
                    <small>⌖ {place.location}</small>
                  </div>

                  <span className="ai2-place-arrow">↗</span>
                </button>
              ))}
            </div>

            <div className="ai2-section-heading ai2-jump-heading">
              <div>
                <span className="ai2-section-kicker">
                  YOUR NEXT JOURNEY
                </span>

                <h2>Get Inspired <span>✧</span></h2>
              </div>

              <span className="ai2-curated">CURATED</span>
            </div>

            <div className="ai2-destination-grid">
              {destinations.slice(2, 4).map((place) => (
                <button
                  type="button"
                  className="ai2-destination-card"
                  key={place.name}
                  onClick={() => sendMessage(null, place.prompt)}
                  disabled={loading}
                >
                  <img src={place.image} alt={place.name} />

                  <span className="ai2-place-tag">
                    ✧ EXPLORE
                  </span>

                  <div className="ai2-place-info">
                    <strong>{place.name}</strong>
                    <small>⌖ {place.location}</small>
                  </div>

                  <span className="ai2-place-arrow">↗</span>
                </button>
              ))}
            </div>

            <div className="ai2-side-note">
              <span>✧</span>

              <div>
                <strong>Every journey begins somewhere.</strong>
                <p>
                  Tell us your dream destination. We'll help you plan it.
                </p>
              </div>
            </div>

          </aside>

        </main>

        <footer className="ai2-footer">
          <span>TRAVEL EXPLORER</span>
          <span>MADE FOR THE LOVE OF TRAVEL ✧</span>
        </footer>

      </div>
    </div>
  );
}

export default AIChat;
