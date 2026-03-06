import RestaurantCard from "../components/RestaurantCard";

function Favorites() {

  const favoriteRestaurants = [
    { id: 1, name: "Pasta Palace", cuisine: "Italian", city: "San Jose" },
    { id: 2, name: "Sushi Zen", cuisine: "Japanese", city: "San Jose" }
  ];

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">My Favorites</h2>

      {favoriteRestaurants.length === 0 ? (
        <p className="text-muted">No favorites yet.</p>
      ) : (
        <div className="row g-4">
          {favoriteRestaurants.map((restaurant) => (
            <div className="col-lg-4 col-md-6" key={restaurant.id}>
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Favorites;