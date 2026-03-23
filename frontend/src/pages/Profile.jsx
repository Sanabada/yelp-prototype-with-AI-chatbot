import { useEffect, useState } from "react";
import { getStoredProfile, saveStoredProfile } from "../utils/storage";

function Profile() {
  const [form, setForm] = useState(getStoredProfile());
  const [message, setMessage] = useState("");

  useEffect(() => {
    saveStoredProfile(form);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        avatar: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveStoredProfile(form);
    setMessage("Profile saved locally.");
    setTimeout(() => setMessage(""), 1500);
  };

  return (
    <div className="container-xl py-4">
      <h2 className="fw-bold mb-4">My Profile</h2>

      {message && <div className="alert alert-success">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 text-center h-100">
            <div className="mb-3">
              <img
                src={form.avatar || "/default-avatar.svg"}
                alt="Profile"
                className="profile-avatar"
                onError={(event) => {
                  event.currentTarget.src = "/default-avatar.svg";
                }}
              />
            </div>

            <input type="file" accept="image/*" className="form-control mb-3" onChange={handleImageUpload} />

            <h5 className="fw-bold mb-1">{form.name || "Your Name"}</h5>
            <p className="text-muted mb-0">{form.email || "email@example.com"}</p>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" name="name" value={form.name} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">City</label>
                <input className="form-control" name="city" value={form.city} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Country</label>
                <input className="form-control" name="country" value={form.country} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Languages</label>
                <input className="form-control" name="languages" value={form.languages} onChange={handleChange} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Gender</label>
                <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">About Me</label>
                <textarea className="form-control" rows="4" name="about" value={form.about} onChange={handleChange} />
              </div>
            </div>

            <button className="btn btn-danger mt-2" type="button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
