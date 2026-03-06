import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "btn-danger" : "btn-outline-dark";

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm px-4">
      <div className="container-fluid">

        <Link className="navbar-brand fw-bold text-danger fs-4" to="/">
          YelpPrototype
        </Link>

        <div className="d-flex gap-2">

          <Link className={`btn btn-sm ${isActive("/")}`} to="/">
            Explore
          </Link>

          <Link className={`btn btn-sm ${isActive("/profile")}`} to="/profile">
            Profile
          </Link>

          <Link className={`btn btn-sm ${isActive("/add-restaurant")}`} to="/add-restaurant">
            Add Restaurant
          </Link>

          <Link className={`btn btn-sm ${isActive("/favorites")}`} to="/favorites">
            Favorites
          </Link>

          <Link className={`btn btn-sm ${isActive("/history")}`} to="/history">
            History
          </Link>

          <Link className={`btn btn-sm ${isActive("/chat")}`} to="/chat">
            AI Assistant
          </Link>

          <Link className="btn btn-outline-dark btn-sm" to="/login">
            Login
          </Link>

          <Link className="btn btn-danger btn-sm" to="/signup">
            Signup
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;