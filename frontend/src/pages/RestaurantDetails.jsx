import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const restaurants = {
      1: {
        name: "Pasta Palace",
        cuisine: "Italian",
        city: "San Jose",
        state: "CA",
        price: "$$",
        rating: 4.5,
        reviewCount: 128,
        description:
          "Authentic Italian cuisine with handcrafted pasta and wood-fired pizzas.",
        address: "123 Main Street",
        phone: "(408) 123-4567",
        hours: "Mon-Sun: 11AM - 10PM",
        images: [
          "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      2: {
        name: "Sushi Zen",
        cuisine: "Japanese",
        city: "San Jose",
        state: "CA",
        price: "$$$",
        rating: 4.7,
        reviewCount: 214,
        description:
          "Fresh sushi, sashimi, and modern Japanese fusion dishes.",
        address: "456 Sakura Avenue",
        phone: "(408) 222-7890",
        hours: "Mon-Sat: 12PM - 11PM",
        images: [
          "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80"
        ]
      },
      3: {
        name: "Spice Garden",
        cuisine: "Indian",
        city: "San Jose",
        state: "CA",
        price: "$$",
        rating: 4.6,
        reviewCount: 176,
        description:
          "Rich Indian flavors with traditional curries and tandoori specialties.",
        address: "789 Curry Lane",
        phone: "(408) 555-6789",
        hours: "Daily: 11AM - 9:30PM",
        images: [
          "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80"
        ]
      },
    };

    setRestaurant(restaurants[id]);
  }, [id]);

  if (!restaurant) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="container mt-4">

      <div className="mb-3">
        <h2 className="fw-bold">{restaurant.name}</h2>
        <div className="d-flex align-items-center gap-3 mt-2">
          <span className="text-warning fw-bold">
            ★ {restaurant.rating}
          </span>
          <span className="text-muted">
            ({restaurant.reviewCount} reviews)
          </span>
          <span>{restaurant.price}</span>
          <span className="text-muted">
            {restaurant.cuisine} • {restaurant.city}, {restaurant.state}
          </span>
        </div>
      </div>

      {/* IMAGE GRID */}
      <div className="row mb-4">
        <div className="col-md-8">
          <img
            src={restaurant.images[0]}
            className="img-fluid rounded"
            style={{ height: "400px", width: "100%", objectFit: "cover" }}
            alt="main"
          />
        </div>
        <div className="col-md-4">
          <img
            src={restaurant.images[1]}
            className="img-fluid rounded"
            style={{ height: "400px", width: "100%", objectFit: "cover" }}
            alt="side"
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <h5 className="fw-bold mb-3">About</h5>
          <p className="text-muted">{restaurant.description}</p>
        </div>

        <div className="col-md-4">
          <div className="card p-3 shadow-sm">
            <h6 className="fw-bold">Location</h6>
            <p className="text-muted">
              {restaurant.address}, {restaurant.city}, {restaurant.state}
            </p>

            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted">{restaurant.phone}</p>

            <h6 className="fw-bold">Hours</h6>
            <p className="text-muted">{restaurant.hours}</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default RestaurantDetails;