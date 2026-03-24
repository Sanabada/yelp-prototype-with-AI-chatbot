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

const makeMessage = (sender, text) => ({
  id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  sender,
  text,
});

function Chatbot() {
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const autoSendTimerRef = useRef(null);
  const lastAutoSentQueryRef = useRef(null);

  const [messages, setMessages] = useState([
    makeMessage(
      "bot",
      "Hi! I'm DineBot. Ask me for cuisine, city, or budget-based restaurant suggestions."
    ),
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState(() =>
    mergeRestaurants(getLocalRestaurants(), getCachedRestaurants(), demoRestaurants)
  );

  const messagesRef = useRef(messages);
  const inputRef = useRef(input);
  const restaurantsRef = useRef(restaurants);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    restaurantsRef.current = restaurants;
  }, [restaurants]);

  const suggestionChips = useMemo(
    () => ["Indian in Sunnyvale", "cheap food", "best Japanese restaurants"],
    []
  );

  const appendMessage = useCallback((message) => {
    setMessages((prev) => {
      const next = [...prev, message];
      messagesRef.current = next;
      return next;
    });
  }, []);

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
      const text = String(overrideText ?? inputRef.current).trim();

      if (!text || sendingRef.current) return;

      sendingRef.current = true;
      setLoading(true);

      const history = messagesRef.current.map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text,
      }));

      appendMessage(makeMessage("user", text));
      setInput("");
      inputRef.current = "";

      try {
        const response = await API.post("/ai-assistant/chat", {
          message: text,
          history,
        });

        const reply =
          response?.data?.response ||
          response?.data?.answer ||
          "Sorry, I could not generate a response right now.";

        appendMessage(makeMessage("bot", reply));
      } catch (error) {
        const detail = error?.response?.data?.detail || "";
        const quotaHit =
          typeof detail === "string" &&
          (detail.includes("insufficient_quota") || detail.includes("Error code: 429"));

        const reply = quotaHit
          ? `My AI service is temporarily unavailable due to API quota limits. Here’s a local recommendation instead:\n\n${buildFallbackReply(
              text,
              restaurantsRef.current
            )}`
          : buildFallbackReply(text, restaurantsRef.current);

        appendMessage(makeMessage("bot", reply));
        console.error("DineBot backend failed, using fallback reply:", error);
      } finally {
        sendingRef.current = false;
        setLoading(false);
      }
    },
    [appendMessage]
  );

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q")?.trim();

    if (!q || lastAutoSentQueryRef.current === q) return;

    lastAutoSentQueryRef.current = q;
    setInput(q);
    inputRef.current = q;

    autoSendTimerRef.current = window.setTimeout(() => {
      handleSend(q);
    }, 200);

    return () => {
      if (autoSendTimerRef.current) {
        window.clearTimeout(autoSendTimerRef.current);
        autoSendTimerRef.current = null;
      }
    };
  }, [location.search, handleSend]);

  useEffect(() => {
    return () => {
      if (autoSendTimerRef.current) {
        window.clearTimeout(autoSendTimerRef.current);
      }
    };
  }, []);

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
          {messages.map((message) => (
            <div
              key={message.id}
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
              disabled={loading}
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
            disabled={loading}
          />
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => handleSend()}
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
