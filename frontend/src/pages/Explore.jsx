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
    } catch (err) {
      // fallback mock data
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
    <div className="container mt-4">

      {/* HERO SECTION */}
      <div className="hero-section mb-5">
        <div className="hero-overlay text-center text-white">
          <h1 className="display-4 fw-bold mb-3">
            Discover Exceptional Dining
          </h1>
          <p className="fs-5 mb-4">
            Explore top-rated restaurants curated just for you.
          </p>

          <div className="input-group hero-search mx-auto">
            <input
              type="text"
              className="form-control"
              placeholder="Search restaurants, cuisines, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-danger px-4">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* RESTAURANT GRID */}
      <div className="row">
        {filtered.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}
      </div>
    </div>
  );
}

export default Explore;