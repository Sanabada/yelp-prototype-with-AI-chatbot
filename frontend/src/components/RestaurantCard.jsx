import { Link } from "react-router-dom";

function getCuisineImage(cuisine) {
  const images = {
    Italian:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
    Japanese:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80",
    Indian:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
  };

  return (
    images[cuisine] ||
    "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=1200&q=80"
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <div className="card restaurant-card h-100">

      <div className="card-img-wrapper">
        <img
          src={getCuisineImage(restaurant.cuisine)}
          alt={restaurant.name}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <h5 className="fw-bold mb-1">{restaurant.name}</h5>

        <p className="text-muted mb-2">
          {restaurant.cuisine} • {restaurant.city}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            <span className="text-warning">★</span>
            <span className="fw-bold ms-1">4.5</span>
          </div>

          <span className="badge bg-dark rounded-pill px-3">
            $$
          </span>
        </div>

        <Link
          to={`/restaurant/${restaurant.id}`}
          className="btn btn-outline-dark w-100 mt-3 rounded-pill"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default RestaurantCard;