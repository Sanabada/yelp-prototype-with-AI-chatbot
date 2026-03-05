import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-4">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold text-danger fs-4" to="/">
          Yelp<span className="text-dark">Prototype</span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {!token ? (
            <>
              <Link className="btn btn-outline-dark rounded-pill px-4" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary rounded-pill px-4" to="/signup">
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-dark rounded-pill px-4" to="/profile">
                Profile
              </Link>
              <Link className="btn btn-primary rounded-pill px-4" to="/chat">
                AI Assistant
              </Link>
              <button className="btn btn-danger rounded-pill px-4" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;