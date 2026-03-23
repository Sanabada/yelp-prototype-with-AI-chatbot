import { Link, useLocation, useNavigate } from "react-router-dom";
import YelpLogo from "./YelpLogo";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userToken = localStorage.getItem("token");
  const ownerToken = localStorage.getItem("owner_token");
  const isAuthed = Boolean(userToken || ownerToken);

  const isActive = (paths) => {
    const list = Array.isArray(paths) ? paths : [paths];
    return list.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))
      ? "btn-danger"
      : "btn-outline-dark";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("owner_token");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container-xl py-2">
        <Link className="navbar-brand text-decoration-none" to="/">
          <YelpLogo size={42} centered={false} showText />
        </Link>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Link className={`btn btn-sm ${isActive(["/", "/explore"])}`} to="/">
            Explore
          </Link>

          {isAuthed && (
            <>
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
            </>
          )}

          {userToken && (
            <Link className={`btn btn-sm ${isActive("/profile")}`} to="/profile">
              Profile
            </Link>
          )}

          {ownerToken && (
            <Link className={`btn btn-sm ${isActive("/owner/dashboard")}`} to="/owner/dashboard">
              Owner Dashboard
            </Link>
          )}

          {!isAuthed ? (
            <>
              <Link className="btn btn-outline-dark btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-danger btn-sm" to="/signup">
                Signup
              </Link>
              <Link className="btn btn-outline-secondary btn-sm" to="/owner/login">
                Owner Login
              </Link>
            </>
          ) : (
            <button className="btn btn-dark btn-sm" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
