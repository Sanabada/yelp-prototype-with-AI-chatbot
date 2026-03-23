import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import YelpLogo from "../components/YelpLogo";

function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      const response = await API.post("/owners/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = response.data?.access_token || response.data?.token;
      if (!token) {
        throw new Error("No owner access token returned.");
      }

      localStorage.removeItem("token");
      localStorage.setItem("owner_token", token);

      const next = location.state?.from || "/owner/dashboard";
      navigate(next);
      window.location.reload();
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || "Owner login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-xl py-4">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm p-4 border-0 rounded-4">
            <div className="mb-3">
              <YelpLogo size={68} />
            </div>

            <h2 className="mb-4 text-center">Owner Login</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <button className="btn btn-danger w-100" disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-3 mb-0 text-center">
              New owner? <Link to="/owner/signup">Create an owner account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerLogin;
