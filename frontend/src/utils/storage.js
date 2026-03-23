const KEYS = {
  localRestaurants: "yelp_local_restaurants",
  cachedRestaurants: "yelp_cached_restaurants",
  favorites: "yelp_favorites",
  history: "yelp_history",
  profile: "yelp_profile",
  reviews: "yelp_local_reviews",
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalRestaurants() {
  return readJSON(KEYS.localRestaurants, []);
}

export function upsertLocalRestaurant(restaurant) {
  const current = getLocalRestaurants();
  const next = [restaurant, ...current.filter((item) => String(item.id) !== String(restaurant.id))];
  writeJSON(KEYS.localRestaurants, next);
  return next;
}

export function getCachedRestaurants() {
  return readJSON(KEYS.cachedRestaurants, []);
}

export function setCachedRestaurants(restaurants) {
  writeJSON(KEYS.cachedRestaurants, restaurants);
}

export function getFavorites() {
  return readJSON(KEYS.favorites, []);
}

export function isFavorite(restaurantId) {
  return getFavorites().some((item) => String(item.id) === String(restaurantId));
}

export function toggleFavorite(restaurant) {
  const current = getFavorites();
  const exists = current.some((item) => String(item.id) === String(restaurant.id));
  const next = exists
    ? current.filter((item) => String(item.id) !== String(restaurant.id))
    : [restaurant, ...current];
  writeJSON(KEYS.favorites, next);
  return !exists;
}

export function getHistory() {
  return readJSON(KEYS.history, []);
}

export function addHistory(action, restaurant) {
  const current = getHistory();
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    restaurantId: restaurant?.id,
    restaurantName: restaurant?.name || "Restaurant",
    city: restaurant?.city || "",
    timestamp: new Date().toISOString(),
  };
  writeJSON(KEYS.history, [entry, ...current].slice(0, 50));
}

export function clearHistory() {
  writeJSON(KEYS.history, []);
}

export function getStoredProfile() {
  return readJSON(KEYS.profile, {
    name: "",
    email: "",
    phone: "",
    city: "",
    country: "United States",
    about: "Food lover",
    languages: "",
    gender: "Prefer not to say",
    avatar: "",
  });
}

export function saveStoredProfile(profile) {
  writeJSON(KEYS.profile, profile);
}

export function getLocalReviews(restaurantId) {
  const all = readJSON(KEYS.reviews, {});
  return all[String(restaurantId)] || [];
}

export function addLocalReview(restaurantId, review) {
  const all = readJSON(KEYS.reviews, {});
  const key = String(restaurantId);
  const next = {
    ...all,
    [key]: [review, ...(all[key] || [])],
  };
  writeJSON(KEYS.reviews, next);
}
