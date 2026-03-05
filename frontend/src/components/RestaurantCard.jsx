import { Link } from "react-router-dom";

function RestaurantCard({ restaurant }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card restaurant-card h-100">

        <img
          src={`https://source.unsplash.com/600x400/?${restaurant.cuisine},food`}
          className="card-img-top"
          alt={restaurant.name}
          style={{ height: "220px", objectFit: "cover" }}
        />

        <div className="card-body d-flex flex-column">
          <h5 className="fw-bold">{restaurant.name}</h5>

          <p className="text-muted mb-2">
            {restaurant.cuisine} • {restaurant.city}
          </p>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="d-flex align-items-center">
              <span className="text-warning me-2 fs-5">★</span>
              <span className="fw-bold">4.5</span>
            </div>

            <span className="badge bg-dark rounded-pill px-3">
              $$ 
            </span>
          </div>

          <Link
            to={`/restaurant/${restaurant.id}`}
            className="btn btn-outline-dark w-100 mt-auto rounded-pill"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RestaurantCard;