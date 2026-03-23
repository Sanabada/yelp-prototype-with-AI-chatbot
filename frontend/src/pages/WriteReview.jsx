import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { addLocalReview } from "../utils/storage";

function WriteReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const payload = {
      rating,
      comment,
      created_at: new Date().toISOString(),
      user_name: "You",
    };

    if (!rating) {
      setError("Please choose a rating.");
      return;
    }

    try {
      await API.post(`/restaurants/${id}/reviews`, payload);
      addLocalReview(id, payload);
      setMessage("Review submitted successfully.");
    } catch (err) {
      addLocalReview(id, payload);
      setError(
        `${err?.response?.data?.detail || "Backend review endpoint failed"}. Review was saved locally.`
      );
    }

    setTimeout(() => navigate(`/restaurant/${id}`), 900);
  };

  return (
    <div className="container-xl py-4">
      <div className="card p-4 shadow-sm border-0">
        <h2 className="fw-bold mb-4">Write a Review</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-warning">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-bold">Your Rating</label>
            <div style={{ fontSize: "28px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    color: star <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                  }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Your Review</label>
            <textarea
              className="form-control"
              rows="5"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share your experience..."
              required
            />
          </div>

          <button type="submit" className="btn btn-danger">
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default WriteReview;
