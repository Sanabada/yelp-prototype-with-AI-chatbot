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
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    try {
      await API.post("/auth/signup", form);

      setSuccess("Account created successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || "Signup failed");
      } else {
        setError("Server connection error");
      }
    }
  };

  return (
    <div className="container-xl mt-5">

      <div className="row justify-content-center">
        <div className="col-md-6">

          <div className="card p-4 shadow-sm">
            <h3 className="fw-bold mb-4 text-center">Create Account</h3>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

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
                <small className="text-muted">
                  Password must be at least 8 characters.
                </small>
              </div>

              <button type="submit" className="btn btn-danger w-100">
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