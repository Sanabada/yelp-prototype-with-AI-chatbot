import { Navigate, useLocation } from "react-router-dom";

function ProtectedOwnerRoute({ children }) {
  const ownerToken = localStorage.getItem("owner_token");
  const location = useLocation();

  if (!ownerToken) {
    return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedOwnerRoute;
