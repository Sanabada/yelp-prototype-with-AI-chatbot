import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import { demoRestaurants } from "../data/demoRestaurants";
import {
  addHistory,
  getCachedRestaurants,
  getFavorites,
  getLocalRestaurants,
  getLocalReviews,
  toggleFavorite,
} from "../utils/storage";
import {
  formatHours,
  getRestaurantImage,
  mergeRestaurants,
  normalizeRestaurant,
} from "../utils/restaurantHelpers";

function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [warning, setWarning] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadRestaurant();
  }, [id]);

  const favorite = useMemo(() => {
    return getFavorites().some((item) => String(item.id) === String(id));
  }, [id, restaurant]);

  const loadRestaurant = async () => {
    setWarning("");

    const fallbackPool = mergeRestaurants(getLocalRestaurants(), getCachedRestaurants(), demoRestaurants);
    const fallbackRestaurant = fallbackPool.find((item) => String(item.id) === String(id));

    try {
      const response = await API.get(`/restaurants/${id}`);
      const item = normalizeRestaurant(response.data, id);
      setRestaurant(item);
      addHistory("Viewed restaurant", item);
    } catch {
      if (fallbackRestaurant) {
        setRestaurant(fallbackRestaurant);
        setWarning("Backend details endpoint failed, so cached/local data is being shown.");
        addHistory("Viewed restaurant", fallbackRestaurant);
      }
    }

    try {
      const reviewResponse = await API.get(`/restaurants/${id}/reviews`);
      const payload = Array.isArray(reviewResponse.data)
        ? reviewResponse.data
        : reviewResponse.data?.reviews || [];
      setReviews([...payload, ...getLocalReviews(id)]);
    } catch {
      setReviews(getLocalReviews(id));
    }
  };

  if (!restaurant) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  const handleFavorite = () => {
    toggleFavorite(restaurant);
    window.location.reload();
  };

  const images = restaurant.photos?.length ? restaurant.photos : [getRestaurantImage(restaurant)];

  return (
    <div className="container-xl py-4">
      {warning && <div className="alert alert-warning">{warning}</div>}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
        <div>
          <h2 className="fw-bold mb-2">{restaurant.name}</h2>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <span className="text-warning fw-bold">★ {restaurant.rating.toFixed(1)}</span>
            <span className="text-muted">({restaurant.review_count} reviews)</span>
            <span>{restaurant.price_tier}</span>
            <span className="text-muted">
              {restaurant.cuisine_type} • {restaurant.city}, {restaurant.state}
            </span>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark" type="button" onClick={handleFavorite}>
            {favorite ? "Remove Favorite" : "Add Favorite"}
          </button>
          <Link className="btn btn-danger" to={`/restaurant/${restaurant.id}/review`}>
            Write Review
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <img
            src={images[0]}
            className="img-fluid rounded details-main-image"
            alt={restaurant.name}
            onError={(event) => {
              event.currentTarget.src = getRestaurantImage(restaurant);
            }}
          />
        </div>
        <div className="col-lg-4">
          <img
            src={images[1] || getRestaurantImage(restaurant)}
            className="img-fluid rounded details-side-image"
            alt={`${restaurant.name} preview`}
            onError={(event) => {
              event.currentTarget.src = getRestaurantImage(restaurant);
            }}
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">About</h5>
            <p className="text-muted mb-0">{restaurant.description}</p>

            {restaurant.keywords?.length > 0 && (
              <div className="mt-4">
                <h6 className="fw-bold mb-2">Keywords</h6>
                <div className="d-flex flex-wrap gap-2">
                  {restaurant.keywords.map((keyword) => (
                    <span key={keyword} className="badge text-bg-light border">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm p-4 mt-4">
            <h5 className="fw-bold mb-3">Reviews</h5>
            {reviews.length === 0 ? (
              <p className="text-muted mb-0">No reviews yet.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((review, index) => (
                  <div key={review.id || index} className="border rounded-3 p-3">
                    <div className="d-flex justify-content-between flex-wrap gap-2">
                      <strong>{review.user_name || review.author || "User"}</strong>
                      <span>★ {review.rating || 0}</span>
                    </div>
                    <p className="mb-1 mt-2">{review.comment || "No comment"}</p>
                    {review.created_at && (
                      <small className="text-muted">
                        {new Date(review.created_at).toLocaleString()}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold">Location</h6>
            <p className="text-muted">
              {restaurant.address || "Address not provided"}
              {restaurant.city ? `, ${restaurant.city}` : ""}
              {restaurant.state ? `, ${restaurant.state}` : ""}
              {restaurant.zip_code ? ` ${restaurant.zip_code}` : ""}
            </p>

            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted mb-2">{restaurant.contact_phone || "No phone listed"}</p>
            <p className="text-muted mb-2">{restaurant.contact_email || "No email listed"}</p>

            <h6 className="fw-bold">Hours</h6>
            <p className="text-muted">{formatHours(restaurant.hours)}</p>

            {restaurant.website && (
              <>
                <h6 className="fw-bold">Website</h6>
                <a href={restaurant.website} target="_blank" rel="noreferrer">
                  {restaurant.website}
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetails;
