import { useState } from "react";

function WriteReview() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Review Submitted:", { rating, comment });
    alert("Review submitted (frontend only for now)");
  };

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">Write a Review</h2>

      <div className="card p-4 shadow-sm">

        <form onSubmit={handleSubmit}>

          {/* STAR RATING */}
          <div className="mb-4">
            <label className="form-label fw-bold">Your Rating</label>
            <div style={{ fontSize: "28px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    color:
                      star <= (hover || rating)
                        ? "#ffc107"
                        : "#e4e5e9",
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

          {/* COMMENT */}
          <div className="mb-4">
            <label className="form-label fw-bold">Your Review</label>
            <textarea
              className="form-control"
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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