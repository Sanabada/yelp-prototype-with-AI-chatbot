import { Link } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Yelp Prototype
        </Link>

        <div>
          {!token ? (
            <>
              <Link className="btn btn-outline-light me-2" to="/login">
                Login
              </Link>
              <Link className="btn btn-warning" to="/signup">
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-light me-2" to="/profile">
                Profile
              </Link>
              <Link className="btn btn-success me-2" to="/chat">
                AI Assistant
              </Link>
              <button className="btn btn-danger" onClick={handleLogout}>
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