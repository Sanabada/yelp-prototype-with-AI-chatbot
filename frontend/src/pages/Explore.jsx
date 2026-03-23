import { useEffect, useMemo, useState } from "react";
import AiAskBar from "../components/AiAskBar";
import RestaurantCard from "../components/RestaurantCard";
import API from "../services/api";
import { demoRestaurants } from "../data/demoRestaurants";
import {
  getCachedRestaurants,
  getLocalRestaurants,
  setCachedRestaurants,
} from "../utils/storage";
import { mergeRestaurants } from "../utils/restaurantHelpers";

function Explore() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setWarning("");

    const local = getLocalRestaurants();
    const cached = getCachedRestaurants();

    try {
      const response = await API.get("/restaurants");
      const payload = Array.isArray(response.data)
        ? response.data
        : response.data?.restaurants || response.data?.items || [];

      const merged = mergeRestaurants(payload, local);
      setRestaurants(merged.length ? merged : mergeRestaurants(local, demoRestaurants));
      setCachedRestaurants(payload);
    } catch {
      setWarning("Backend restaurants endpoint failed, so local/demo data is being shown.");
      setRestaurants(mergeRestaurants(local, cached, demoRestaurants));
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return restaurants;

    return restaurants.filter((restaurant) => {
      const keywords = Array.isArray(restaurant.keywords)
        ? restaurant.keywords.join(" ")
        : "";

      return [
        restaurant.name,
        restaurant.cuisine_type,
        restaurant.city,
        keywords,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [restaurants, search]);

  return (
    <div className="container-xl py-4">
      <div className="hero-section mb-4">
        <div className="hero-panel text-center">
          <h1 className="fw-bold text-dark">Discover Exceptional Dining</h1>
          <p className="mb-0 fw-medium text-danger">
            Explore restaurants, manage favorites, and use DineBot for quick suggestions.
          </p>

          <div className="input-group hero-search mx-auto mt-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by restaurant, cuisine, city, or keyword..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button className="btn btn-danger px-4" type="button" onClick={fetchRestaurants}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <AiAskBar />

      {warning && <div className="alert alert-warning mt-3">{warning}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-card text-center">
          <h4 className="fw-bold">No restaurants found</h4>
          <p className="text-muted mb-0">Try a different search or add a new restaurant.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;