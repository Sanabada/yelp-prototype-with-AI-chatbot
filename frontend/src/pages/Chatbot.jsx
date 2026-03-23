import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { demoRestaurants } from "../data/demoRestaurants";
import API from "../services/api";
import { mergeRestaurants } from "../utils/restaurantHelpers";
import { buildFallbackReply } from "../utils/aiFallback";
import {
  getCachedRestaurants,
  getLocalRestaurants,
  setCachedRestaurants,
} from "../utils/storage";

function Chatbot() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: 'Hi! I\'m DineBot. Ask me for cuisine, city, or budget-based restaurant suggestions.',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSent, setAutoSent] = useState(false);
  const [restaurants, setRestaurants] = useState(() =>
    mergeRestaurants(getLocalRestaurants(), getCachedRestaurants(), demoRestaurants)
  );

  const suggestionChips = useMemo(
    () => ["Indian in Sunnyvale", "cheap food", "best Japanese restaurants"],
    []
  );

  const loadRestaurants = useCallback(async () => {
    const local = getLocalRestaurants();
    const cached = getCachedRestaurants();
    setRestaurants(mergeRestaurants(local, cached, demoRestaurants));

    try {
      const response = await API.get("/restaurants");
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.restaurants || response.data?.items || [];

      setCachedRestaurants(payload);
      setRestaurants(mergeRestaurants(payload, local, demoRestaurants));
    } catch {
      setRestaurants(mergeRestaurants(local, cached, demoRestaurants));
    }
  }, []);

  const handleSend = useCallback(
    async (overrideText = null) => {
      const text = String(overrideText ?? input).trim();
      if (!text || loading) return;

      const history = messages.map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text,
      }));

      setMessages((prev) => [...prev, { sender: "user", text }]);
      setInput("");
      setLoading(true);

      try {
        const response = await API.post("/ai-assistant/chat", {
          message: text,
          history,
        });

        const reply =
          response?.data?.response ||
          response?.data?.answer ||
          "Sorry, I could not generate a response right now.";

        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      } catch (error) {
        const reply = buildFallbackReply(text, restaurants);
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
        console.error("DineBot backend failed, using fallback reply:", error);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, restaurants]
  );

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");

    if (q && !autoSent) {
      setInput(q);
      setAutoSent(true);
      window.setTimeout(() => {
        handleSend(q);
      }, 200);
    }
  }, [location.search, autoSent, handleSend]);

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-1">DineBot</h2>
          <p className="text-muted mb-0">
            Ask for cuisine, city, budget, or restaurant feature suggestions.
          </p>
        </div>
      </div>

      <div className="card shadow-sm p-4 border-0 chatbot-shell">
        <div className="chatbot-messages">
          {messages.map((message, index) => (
            <div
              key={`${message.sender}-${index}`}
              style={{
                textAlign: message.sender === "user" ? "right" : "left",
                marginBottom: "12px",
              }}
            >
              <span className={`chat-bubble ${message.sender === "user" ? "user" : "bot"}`}>
                {message.text}
              </span>
            </div>
          ))}

          {loading && (
            <div style={{ textAlign: "left", marginBottom: "12px" }}>
              <span className="chat-bubble bot">DineBot is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="d-flex flex-wrap gap-2 mt-3 mb-3">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              className="btn btn-outline-dark btn-sm"
              type="button"
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="input-group mt-1">
          <input
            type="text"
            className="form-control"
            placeholder="Ask DineBot for a cuisine, city, or budget..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="btn btn-danger" type="button" onClick={() => handleSend()} disabled={loading}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
