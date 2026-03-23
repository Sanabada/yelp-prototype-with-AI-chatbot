import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import YelpLogo from "../components/YelpLogo";

function OwnerSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    restaurant_location: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await API.post("/owners/signup", form);
      navigate("/owner/login");
    } catch (err) {
      setError(err?.response?.data?.detail || "Owner signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-xl py-4">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="card shadow-sm p-4 border-0 rounded-4">
            <div className="mb-3">
              <YelpLogo size={68} />
            </div>

            <h2 className="mb-4 text-center">Owner Signup</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Restaurant Location</label>
                <input
                  className="form-control"
                  name="restaurant_location"
                  value={form.restaurant_location}
                  onChange={handleChange}
                  placeholder="San Jose"
                />
              </div>

              <button className="btn btn-danger w-100" disabled={submitting}>
                {submitting ? "Creating account..." : "Create Owner Account"}
              </button>
            </form>

            <p className="mt-3 mb-0 text-center">
              Already an owner? <Link to="/owner/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerSignup;
