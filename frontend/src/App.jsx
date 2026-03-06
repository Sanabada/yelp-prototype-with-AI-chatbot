import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Explore from "./pages/Explore";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AddRestaurant from "./pages/AddRestaurant";
import WriteReview from "./pages/WriteReview";
import RestaurantDetails from "./pages/RestaurantDetails";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import Chatbot from "./pages/Chatbot";

function App() {
  return (
    <Router>

      <Navbar />

      <Routes>
        <Route path="/" element={<Explore />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/add-restaurant" element={<AddRestaurant />} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/history" element={<History />} />
        <Route path="/chat" element={<Chatbot />} />
      </Routes>

    </Router>
  );
}

export default App;