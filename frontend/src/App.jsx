import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import RestaurantDetails from "./pages/RestaurantDetails";
import AddRestaurant from "./pages/AddRestaurant";
import Chatbot from "./pages/Chatbot";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Explore />} />
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
            path="/add-restaurant"
            element={
              <ProtectedRoute>
                <AddRestaurant />
              </ProtectedRoute>
            }
          />
          <Route path="/restaurant/:id" element={<RestaurantDetails />} />
          <Route path="/chat" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;