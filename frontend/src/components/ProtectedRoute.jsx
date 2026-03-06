function ProtectedRoute({ children }) {
  // Temporary: allow all access during development
  return children;
}

export default ProtectedRoute;