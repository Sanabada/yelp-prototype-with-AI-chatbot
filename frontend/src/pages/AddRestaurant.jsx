import { useState } from "react";

function AddRestaurant() {
  const [form, setForm] = useState({
    name: "",
    cuisine: "",
    city: "",
    state: "",
    price: "",
    contact: "",
    description: "",
    hours: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Restaurant Data:", form);
    alert("Restaurant submitted (frontend only for now)");
  };

  return (
    <div className="container-xl mt-5">

      <h2 className="fw-bold mb-4">Add New Restaurant</h2>

      <div className="card p-4 shadow-sm">
        <form onSubmit={handleSubmit}>

          <div className="row">

            <div className="col-md-6 mb-3">
              <label className="form-label">Restaurant Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Cuisine Type</label>
              <select
                className="form-select"
                name="cuisine"
                value={form.cuisine}
                onChange={handleChange}
                required
              >
                <option value="">Select Cuisine</option>
                <option>Italian</option>
                <option>Japanese</option>
                <option>Indian</option>
                <option>Mexican</option>
                <option>American</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-control"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-control"
                name="state"
                value={form.state}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Price Tier</label>
              <select
                className="form-select"
                name="price"
                value={form.price}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>$</option>
                <option>$$</option>
                <option>$$$</option>
                <option>$$$$</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                className="form-control"
                name="contact"
                value={form.contact}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Operating Hours</label>
              <input
                type="text"
                className="form-control"
                name="hours"
                value={form.hours}
                onChange={handleChange}
                placeholder="e.g. Mon-Sun: 11AM - 10PM"
              />
            </div>

            <div className="col-12 mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="4"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

          </div>

          <button type="submit" className="btn btn-danger">
            Submit Restaurant
          </button>

        </form>
      </div>

    </div>
  );
}

export default AddRestaurant;