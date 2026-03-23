import { useEffect, useState } from "react";
import API, { getOwnerConfig } from "../services/api";
import { getLocalRestaurants, upsertLocalRestaurant } from "../utils/storage";
import { buildRestaurantPayload, normalizeRestaurant } from "../utils/restaurantHelpers";

const emptyRestaurant = {
  name: "",
  cuisine_type: "",
  city: "",
  description: "",
  address: "",
  state: "",
  country: "USA",
  zip_code: "",
  contact_phone: "",
  contact_email: "",
  website: "",
  price_tier: "$$",
  keywords: "",
  photos: "",
  hours: '{"general":"Mon-Sun: 11AM - 10PM"}',
};

function OwnerDashboard() {
  const [owner, setOwner] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [claimRestaurantId, setClaimRestaurantId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [restaurantForm, setRestaurantForm] = useState(emptyRestaurant);
  const localRestaurants = getLocalRestaurants();

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    setError("");
    try {
      const [ownerRes, dashboardRes] = await Promise.all([
        API.get("/owners/me", getOwnerConfig()),
        API.get("/owners/dashboard", getOwnerConfig()),
      ]);

      setOwner(ownerRes.data);
      setDashboard(dashboardRes.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load owner dashboard. Local fallback remains available.");
    }
  };

  const handleRestaurantChange = (event) => {
    const { name, value } = event.target;
    setRestaurantForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createRestaurant = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = buildRestaurantPayload(restaurantForm);
      const response = await API.post("/owners/restaurants", payload, getOwnerConfig());
      const restaurant = normalizeRestaurant(response.data || payload, response.data?.id || `local-${Date.now()}`);
      upsertLocalRestaurant(restaurant);
      setMessage("Restaurant created successfully.");
      setRestaurantForm(emptyRestaurant);
      await loadOwnerData();
    } catch (err) {
      const payload = buildRestaurantPayload(restaurantForm);
      upsertLocalRestaurant(normalizeRestaurant(payload, `local-${Date.now()}`));
      setError(
        `${err?.response?.data?.detail || "Could not create restaurant on backend"}. It was still saved locally.`
      );
      setRestaurantForm(emptyRestaurant);
    }
  };

  const claimRestaurant = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.post(`/owners/restaurants/${claimRestaurantId}/claim`, {}, getOwnerConfig());
      setMessage("Restaurant claimed successfully.");
      setClaimRestaurantId("");
      await loadOwnerData();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not claim restaurant");
    }
  };

  const fetchReviews = async () => {
    if (!selectedRestaurantId) return;

    setError("");
    try {
      const response = await API.get(
        `/owners/restaurants/${selectedRestaurantId}/reviews`,
        getOwnerConfig()
      );
      setReviews(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load restaurant reviews");
      setReviews([]);
    }
  };

  const stats = dashboard || {
    total_restaurants: localRestaurants.length,
    total_reviews: 0,
    average_rating: "—",
    total_views: "—",
  };

  return (
    <div className="container-xl py-4">
      <h2 className="mb-4 fw-bold">Owner Dashboard</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-warning">{error}</div>}

      {owner && (
        <div className="card shadow-sm p-4 mb-4 border-0">
          <h4 className="mb-3">Owner Profile</h4>
          <p className="mb-1"><strong>Name:</strong> {owner.name}</p>
          <p className="mb-1"><strong>Email:</strong> {owner.email}</p>
          <p className="mb-0">
            <strong>Restaurant Location:</strong> {owner.restaurant_location || "Not set"}
          </p>
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h6>Total Restaurants</h6>
            <h3>{stats.total_restaurants}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h6>Total Reviews</h6>
            <h3>{stats.total_reviews}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h6>Average Rating</h6>
            <h3>{stats.average_rating}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm p-3 border-0">
            <h6>Total Views</h6>
            <h3>{stats.total_views}</h3>
          </div>
        </div>
      </div>

      <div className="card shadow-sm p-4 mb-4 border-0">
        <h4 className="mb-3">Create Restaurant Listing</h4>
        <form onSubmit={createRestaurant}>
          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" name="name" placeholder="Restaurant name" value={restaurantForm.name} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" name="cuisine_type" placeholder="Cuisine type" value={restaurantForm.cuisine_type} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-6">
              <input className="form-control" name="city" placeholder="City" value={restaurantForm.city} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" name="state" placeholder="CA" value={restaurantForm.state} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" name="country" placeholder="Country" value={restaurantForm.country} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-8">
              <input className="form-control" name="address" placeholder="Address" value={restaurantForm.address} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="zip_code" placeholder="Zip code" value={restaurantForm.zip_code} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-12">
              <textarea className="form-control" name="description" rows="3" placeholder="Description" value={restaurantForm.description} onChange={handleRestaurantChange} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="contact_phone" placeholder="Contact phone" value={restaurantForm.contact_phone} onChange={handleRestaurantChange} />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="contact_email" placeholder="Contact email" value={restaurantForm.contact_email} onChange={handleRestaurantChange} />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="website" placeholder="Website" value={restaurantForm.website} onChange={handleRestaurantChange} />
            </div>
            <div className="col-md-4">
              <select className="form-select" name="price_tier" value={restaurantForm.price_tier} onChange={handleRestaurantChange}>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
                <option value="$$$$">$$$$</option>
              </select>
            </div>
            <div className="col-md-4">
              <input className="form-control" name="keywords" placeholder="wifi, family-friendly" value={restaurantForm.keywords} onChange={handleRestaurantChange} />
            </div>
            <div className="col-md-4">
              <input className="form-control" name="photos" placeholder="comma separated photo URLs" value={restaurantForm.photos} onChange={handleRestaurantChange} />
            </div>
            <div className="col-12">
              <textarea
                className="form-control"
                name="hours"
                rows="3"
                placeholder='{"general":"Mon-Sun: 11AM - 10PM"}'
                value={restaurantForm.hours}
                onChange={handleRestaurantChange}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-danger">Create Restaurant</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-4 mb-4 border-0">
        <h4 className="mb-3">Claim Existing Restaurant</h4>
        <form onSubmit={claimRestaurant} className="row g-3">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Restaurant ID to claim"
              value={claimRestaurantId}
              onChange={(event) => setClaimRestaurantId(event.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <button className="btn btn-outline-dark w-100">Claim Restaurant</button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm p-4 border-0">
        <h4 className="mb-3">Reviews Dashboard</h4>
        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="Owned restaurant ID"
              value={selectedRestaurantId}
              onChange={(event) => setSelectedRestaurantId(event.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button className="btn btn-outline-dark w-100" type="button" onClick={fetchReviews}>
              Load Reviews
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <p className="text-muted mb-0">No reviews loaded yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded p-3">
                <div className="d-flex justify-content-between">
                  <strong>User #{review.user_id || review.user_name || "User"}</strong>
                  <span>★ {review.rating}</span>
                </div>
                <p className="mb-1 mt-2">{review.comment || "No comment"}</p>
                <small className="text-muted">
                  {review.created_at ? new Date(review.created_at).toLocaleString() : "Recent"}
                </small>
              </div>
            ))}
          </div>
        )}

        {localRestaurants.length > 0 && (
          <div className="mt-4">
            <h5 className="fw-bold mb-3">Locally Saved Restaurants</h5>
            <div className="d-flex flex-column gap-2">
              {localRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="border rounded p-3">
                  <div className="d-flex justify-content-between flex-wrap gap-2">
                    <strong>{restaurant.name}</strong>
                    <span className="text-muted">ID: {restaurant.id}</span>
                  </div>
                  <small className="text-muted">
                    {restaurant.cuisine_type} • {restaurant.city} • {restaurant.price_tier}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;
