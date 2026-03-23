import { useMemo, useState } from "react";
import { demoRestaurants } from "../data/demoRestaurants";
import { getCachedRestaurants, getLocalRestaurants } from "../utils/storage";
import { mergeRestaurants } from "../utils/restaurantHelpers";

function getSuggestion(input, restaurants) {
  const text = input.toLowerCase();

  const matchedCuisine = restaurants.find((item) =>
    [item.cuisine_type, item.name, item.city, ...(item.keywords || [])]
      .join(" ")
      .toLowerCase()
      .includes(text)
  );

  if (text.includes("cheap") || text.includes("budget")) {
    const cheap = restaurants.find((item) => item.price_tier === "$" || item.price_tier === "$$");
    if (cheap) {
      return `Try ${cheap.name} in ${cheap.city}. It is a ${cheap.cuisine_type} option around ${cheap.price_tier}.`;
    }
  }

  if (text.includes("favorite")) {
    return "You can save favorites from restaurant cards or the restaurant details page.";
  }

  if (text.includes("add restaurant")) {
    return "Use the Add Restaurant page. If the backend is down, the app still saves a local copy so it appears in the frontend.";
  }

  if (matchedCuisine) {
    return `You may like ${matchedCuisine.name} in ${matchedCuisine.city}. It serves ${matchedCuisine.cuisine_type} and is rated about ${matchedCuisine.rating.toFixed(1)}.`;
  }

  const sample = restaurants[0];
  return `Try asking for a cuisine, city, or price range. For example: "Japanese in Sunnyvale" or "cheap food". You could start with ${sample?.name || "Pasta Palace"}.`;
}

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me for cuisine, city, or budget-based restaurant suggestions." },
  ]);
  const [input, setInput] = useState("");

  const restaurants = useMemo(() => {
    return mergeRestaurants(getLocalRestaurants(), getCachedRestaurants(), demoRestaurants);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const reply = getSuggestion(input, restaurants);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: input },
      { sender: "bot", text: reply },
    ]);

    setInput("");
  };

  return (
    <div className="container-xl py-4">
      <h2 className="fw-bold mb-4">AI Assistant</h2>

      <div className="card shadow-sm p-4 border-0 chatbot-shell">
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                marginBottom: "12px",
              }}
            >
              <span
                className={`chat-bubble ${msg.sender === "user" ? "user" : "bot"}`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        <div className="input-group mt-3">
          <input
            type="text"
            className="form-control"
            placeholder="Ask for a cuisine, city, or budget..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button className="btn btn-danger" type="button" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
