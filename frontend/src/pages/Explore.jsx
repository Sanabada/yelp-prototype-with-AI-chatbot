import { useEffect, useState } from "react";
import RestaurantCard from "../components/RestaurantCard";
import API from "../services/api";

function Explore() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await API.get("/restaurants");
      setRestaurants(response.data);
    } catch {
      setRestaurants([
        { id: 1, name: "Pasta Palace", cuisine: "Italian", city: "San Jose" },
        { id: 2, name: "Sushi Zen", cuisine: "Japanese", city: "San Jose" },
        { id: 3, name: "Spice Garden", cuisine: "Indian", city: "San Jose" },
      ]);
    }
  };

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-xl mt-5">

      {/* HERO */}
      <div className="text-center mb-5">
        <h1 className="fw-bold display-5">
          Find the Best Restaurants
        </h1>
        <p className="text-muted fs-5">
          Search top-rated restaurants and discover new favorites.
        </p>

        <div className="d-flex justify-content-center mt-4">
          <div style={{ width: "450px" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-danger px-4">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {filtered.length === 0 ? (
        <div className="text-center mt-5">
          <h4 className="fw-bold">No restaurants found</h4>
          <p className="text-muted">
            Try searching with a different name or keyword.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((restaurant) => (
            <div className="col-lg-4 col-md-6 col-sm-12" key={restaurant.id}>
              <RestaurantCard restaurant={restaurant} />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Explore;