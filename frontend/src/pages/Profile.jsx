import { useState } from "react";

function Profile() {
  const [profileImage, setProfileImage] = useState(null);

  const [form, setForm] = useState({
    name: "Revanth",
    email: "revanth0211@gmail.com",
    phone: "4709170545",
    city: "San Jose",
    country: "United States",
    about: "I am a Foodie!",
    languages: "",
    gender: "Male"
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">My Profile</h2>

      <div className="row">

        {/* LEFT SIDE */}
        <div className="col-md-4">
          <div className="card p-4 shadow-sm text-center">

            <div className="mb-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "50%",
                    backgroundColor: "#ddd",
                    margin: "0 auto"
                  }}
                ></div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              className="form-control mb-3"
              onChange={handleImageUpload}
            />

            <h5 className="fw-bold">{form.name}</h5>
            <p className="text-muted">{form.email}</p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-md-8">
          <div className="card p-4 shadow-sm">

            <div className="row">

              <div className="col-md-6 mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Languages</label>
                <input
                  type="text"
                  className="form-control"
                  name="languages"
                  value={form.languages}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">About Me</label>
                <textarea
                  className="form-control"
                  rows="3"
                  name="about"
                  value={form.about}
                  onChange={handleChange}
                />
              </div>

            </div>

            <button className="btn btn-danger mt-3">
              Save Changes
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Profile;