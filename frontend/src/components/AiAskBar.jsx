import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AiAskBar() {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const goToDineBot = (value) => {
    const text = String(value || "").trim();
    if (!text) return;
    navigate(`/chat?q=${encodeURIComponent(text)}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    goToDineBot(question);
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 mt-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
          <div>
            <h4 className="fw-bold mb-1">Ask DineBot</h4>
            <p className="text-muted mb-0">
              Get restaurant suggestions by cuisine, city, budget, or dining preference.
            </p>
          </div>
          <span className="badge text-bg-danger px-3 py-2">AI Help</span>
        </div>

        <form className="input-group" onSubmit={handleSubmit}>
          <input
            type="text"
            className="form-control"
            placeholder='Try "Indian in Sunnyvale" or "cheap Japanese food"'
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button className="btn btn-danger px-4" type="submit">
            Ask DineBot
          </button>
        </form>

        <div className="d-flex flex-wrap gap-2 mt-3">
          <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => goToDineBot("Indian in Sunnyvale")}>
            Indian in Sunnyvale
          </button>
          <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => goToDineBot("cheap food") }>
            Cheap food
          </button>
          <button className="btn btn-outline-dark btn-sm" type="button" onClick={() => goToDineBot("best Japanese restaurants") }>
            Best Japanese restaurants
          </button>
        </div>
      </div>
    </div>
  );
}

export default AiAskBar;
