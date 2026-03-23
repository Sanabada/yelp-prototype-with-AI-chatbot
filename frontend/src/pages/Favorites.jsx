import { Link } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import { getFavorites } from "../utils/storage";

function Favorites() {
  const favorites = getFavorites();

  return (
    <div className="container-xl py-4">
      <h2 className="fw-bold mb-4">My Favorites</h2>

      {favorites.length === 0 ? (
        <div className="empty-card text-center">
          <h4 className="fw-bold">No favorites yet</h4>
          <p className="text-muted">Save restaurants from the explore page or restaurant details page.</p>
          <Link to="/" className="btn btn-danger">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
