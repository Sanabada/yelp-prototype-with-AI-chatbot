import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedOwnerRoute from "./components/ProtectedOwnerRoute";
import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import AddRestaurant from "./pages/AddRestaurant";
import RestaurantDetails from "./pages/RestaurantDetails";
import WriteReview from "./pages/WriteReview";
import Chatbot from "./pages/Chatbot";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerSignup from "./pages/OwnerSignup";
import OwnerDashboard from "./pages/OwnerDashboard";

function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h2 className="fw-bold mb-2">Page not found</h2>
      <p className="text-muted mb-0">Check the route and try again.</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-restaurant"
              element={
                <ProtectedRoute>
                  <AddRestaurant />
                </ProtectedRoute>
              }
            />

            <Route path="/restaurant/:id" element={<RestaurantDetails />} />

            <Route
              path="/restaurant/:id/review"
              element={
                <ProtectedRoute>
                  <WriteReview />
                </ProtectedRoute>
              }
            />

            <Route path="/chat" element={<Chatbot />} />

            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/signup" element={<OwnerSignup />} />
            <Route
              path="/owner/dashboard"
              element={
                <ProtectedOwnerRoute>
                  <OwnerDashboard />
                </ProtectedOwnerRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
