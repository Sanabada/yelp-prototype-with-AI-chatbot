import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/auth/signup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row align-items-center">
        
        <div className="col-md-6">
          <h1 className="fw-bold mb-3">
            Discover the best restaurants around you
          </h1>
          <p className="text-muted fs-5">
            Join our Yelp-style platform and explore top-rated places,
            personalized recommendations, and AI-powered suggestions.
          </p>
        </div>

        <div className="col-md-6">
          <div className="card card-shadow p-4">
            <h3 className="text-center mb-4 fw-bold">Create Account</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="btn btn-primary w-100 rounded-pill">
                Sign Up
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;