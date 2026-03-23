import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import YelpLogo from "../components/YelpLogo";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password" && value.length > 0 && value.length < 8) {
      setError("Please enter a minimum 8 character password.");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    if (form.password.length < 8) {
      setError("Please enter a minimum 8 character password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await API.post("/auth/signup", form);
      setSuccess("Account created successfully.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-xl py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card p-4 shadow-sm border-0 rounded-4">
            <div className="mb-3">
              <YelpLogo size={68} />
            </div>

            <h3 className="fw-bold mb-4 text-center">Create Account</h3>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength="8"
                  required
                />
                <small className="text-muted">Password must be at least 8 characters.</small>
              </div>

              <button type="submit" className="btn btn-danger w-100" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-center mt-3 mb-0">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
