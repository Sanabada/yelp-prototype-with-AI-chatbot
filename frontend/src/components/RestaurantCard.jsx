import { useState } from "react";
import { Link } from "react-router-dom";
import { addHistory, isFavorite, toggleFavorite } from "../utils/storage";
import { getRestaurantImage, normalizeRestaurant } from "../utils/restaurantHelpers";

function RestaurantCard({ restaurant }) {
  const item = normalizeRestaurant(restaurant);
  const [favorite, setFavorite] = useState(isFavorite(item.id));

  const handleFavorite = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = toggleFavorite(item);
    setFavorite(next);
  };

  const handleView = () => {
    addHistory("Viewed restaurant", item);
  };

  return (
    <div className="col-lg-4 col-md-6 col-sm-12">
      <div className="card restaurant-card h-100 border-0 shadow-sm">
        <div className="card-img-wrapper">
          <img
            src={getRestaurantImage(item)}
            alt={item.name}
            onError={(event) => {
              event.currentTarget.src =
                "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80";
            }}
          />
          <button
            type="button"
            className={`favorite-chip ${favorite ? "active" : ""}`}
            onClick={handleFavorite}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="fw-bold mb-1">{item.name}</h5>

          <p className="text-muted mb-2">
            {item.cuisine_type} • {item.city || "Unknown city"}
          </p>

          <p className="restaurant-description text-muted mb-3">{item.description}</p>

          <div className="d-flex justify-content-between align-items-center mt-auto">
            <div>
              <span className="text-warning">★</span>
              <span className="fw-bold ms-1">{item.rating.toFixed(1)}</span>
              <span className="text-muted ms-2">({item.review_count})</span>
            </div>

            <span className="badge bg-dark rounded-pill px-3">{item.price_tier}</span>
          </div>

          <Link
            to={`/restaurant/${item.id}`}
            className="btn btn-outline-dark w-100 mt-3 rounded-pill"
            onClick={handleView}
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;
