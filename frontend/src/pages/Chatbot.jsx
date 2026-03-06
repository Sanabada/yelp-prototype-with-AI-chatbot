import { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you find a restaurant today?" }
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const updatedMessages = [
      ...messages,
      { sender: "user", text: input },
      { sender: "bot", text: "Backend AI integration coming next." }
    ];

    setMessages(updatedMessages);
    setInput("");
  };

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">AI Assistant</h2>

      <div className="card shadow-sm p-4"
           style={{ height: "550px", display: "flex", flexDirection: "column" }}>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                textAlign: msg.sender === "user" ? "right" : "left",
                marginBottom: "12px"
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "10px 15px",
                  borderRadius: "20px",
                  backgroundColor:
                    msg.sender === "user" ? "#e10600" : "#f1f1f1",
                  color: msg.sender === "user" ? "white" : "black",
                  maxWidth: "70%"
                }}
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
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-danger" onClick={handleSend}>
            Send
          </button>
        </div>

      </div>

    </div>
  );
}

export default Chatbot;