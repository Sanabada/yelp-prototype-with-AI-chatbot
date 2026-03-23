import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API, { getOwnerConfig } from "../services/api";
import { upsertLocalRestaurant } from "../utils/storage";
import { buildRestaurantPayload, normalizeRestaurant } from "../utils/restaurantHelpers";

const initialForm = {
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
  hours: '{"general":"Mon-Sun: 11AM - 10PM"}',
  photos: "",
  price_tier: "$$",
  keywords: "",
};

function AddRestaurant() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const ownerToken = localStorage.getItem("owner_token");

  const submitLabel = useMemo(() => {
    return ownerToken ? "Create Restaurant" : "Submit Restaurant";
  }, [ownerToken]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = buildRestaurantPayload(form);
      let response;

      if (ownerToken) {
        response = await API.post("/owners/restaurants", payload, getOwnerConfig());
      } else {
        response = await API.post("/restaurants", payload);
      }

      const restaurant = normalizeRestaurant(response.data || payload, response.data?.id || `local-${Date.now()}`);
      upsertLocalRestaurant(restaurant);
      setMessage("Restaurant saved successfully.");
      setForm(initialForm);

      setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Backend request failed";
      const localRestaurant = normalizeRestaurant(buildRestaurantPayload(form), `local-${Date.now()}`);
      upsertLocalRestaurant(localRestaurant);
      setError(`${detail}. It was still saved locally so it shows in the frontend.`);
      setForm(initialForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-xl py-4">
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
          <div>
            <h2 className="fw-bold mb-1">Add New Restaurant</h2>
            <p className="text-muted mb-0">
              This form matches your backend restaurant schema and also stores a local fallback copy.
            </p>
          </div>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-warning">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Restaurant Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="col-md-6">
              <label className="form-label">Cuisine Type</label>
              <input className="form-control" name="cuisine_type" value={form.cuisine_type} onChange={handleChange} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">City</label>
              <input className="form-control" name="city" value={form.city} onChange={handleChange} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">State</label>
              <input className="form-control" name="state" placeholder="CA or California" value={form.state} onChange={handleChange} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Price Tier</label>
              <select className="form-select" name="price_tier" value={form.price_tier} onChange={handleChange}>
                <option value="$">$</option>
                <option value="$$">$$</option>
                <option value="$$$">$$$</option>
                <option value="$$$$">$$$$</option>
              </select>
            </div>

            <div className="col-md-8">
              <label className="form-label">Address</label>
              <input className="form-control" name="address" value={form.address} onChange={handleChange} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Zip Code</label>
              <input className="form-control" name="zip_code" value={form.zip_code} onChange={handleChange} required />
            </div>

            <div className="col-md-4">
              <label className="form-label">Contact Phone</label>
              <input className="form-control" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Contact Email</label>
              <input className="form-control" name="contact_email" type="email" value={form.contact_email} onChange={handleChange} />
            </div>

            <div className="col-md-4">
              <label className="form-label">Country</label>
              <input className="form-control" name="country" value={form.country} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Website</label>
              <input className="form-control" name="website" value={form.website} onChange={handleChange} placeholder="https://example.com" />
            </div>

            <div className="col-md-6">
              <label className="form-label">Photos</label>
              <input
                className="form-control"
                name="photos"
                value={form.photos}
                onChange={handleChange}
                placeholder="comma separated URLs"
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Keywords</label>
              <input
                className="form-control"
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
                placeholder="cookies, brunch, family friendly"
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="4" name="description" value={form.description} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">Hours</label>
              <textarea
                className="form-control"
                rows="3"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                placeholder='{"general":"Mon-Sun: 11AM - 10PM"}'
              />
            </div>
          </div>

          <button type="submit" className="btn btn-danger mt-4" disabled={saving}>
            {saving ? "Saving..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRestaurant;
