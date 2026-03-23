const stateMap = {
  california: "CA",
  texas: "TX",
  newyork: "NY",
  "new york": "NY",
  georgia: "GA",
  florida: "FL",
  washington: "WA",
  arizona: "AZ",
  nevada: "NV",
};

export function normalizeState(value) {
  const raw = (value || "").trim();
  if (!raw) return "";
  if (raw.length === 2) return raw.toUpperCase();

  const key = raw.toLowerCase().replace(/\./g, "");
  if (stateMap[key]) return stateMap[key];

  return raw.slice(0, 2).toUpperCase();
}

export function textToArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseHoursInput(value) {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  const raw = String(value).trim();
  if (!raw) return {};

  if (raw.startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch {
      return { general: raw };
    }
  }

  return { general: raw };
}

export function formatHours(hours) {
  if (!hours) return "Hours not provided";

  if (typeof hours === "string") return hours;

  const entries = Object.entries(hours);
  if (entries.length === 0) return "Hours not provided";

  return entries
    .map(([day, value]) => `${capitalize(day)}: ${value}`)
    .join(" | ");
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

export function normalizeRestaurant(raw, fallbackId) {
  const cuisine = raw?.cuisine_type || raw?.cuisine || "Restaurant";
  const priceTier = raw?.price_tier || raw?.price || "$$";
  const photos = Array.isArray(raw?.photos)
    ? raw.photos
    : raw?.photo
      ? [raw.photo]
      : raw?.image
        ? [raw.image]
        : [];
  const keywords = Array.isArray(raw?.keywords) ? raw.keywords : textToArray(raw?.keywords);
  const hours =
    typeof raw?.hours === "object" && raw?.hours !== null
      ? raw.hours
      : raw?.hours
        ? { general: raw.hours }
        : {};

  return {
    id: raw?.id ?? fallbackId ?? `local-${Date.now()}`,
    name: raw?.name || "Unnamed Restaurant",
    cuisine_type: cuisine,
    cuisine,
    city: raw?.city || "",
    description: raw?.description || "No description available yet.",
    address: raw?.address || "",
    state: raw?.state || "",
    country: raw?.country || "USA",
    zip_code: raw?.zip_code || "",
    contact_phone: raw?.contact_phone || raw?.phone || "",
    contact_email: raw?.contact_email || "",
    website: raw?.website || "",
    hours,
    photos,
    price_tier: priceTier,
    price: priceTier,
    keywords,
    rating: Number(raw?.rating ?? raw?.average_rating ?? 4.5),
    review_count: Number(raw?.review_count ?? raw?.reviewCount ?? 0),
  };
}

export function buildRestaurantPayload(form) {
  return {
    name: form.name.trim(),
    cuisine_type: form.cuisine_type.trim(),
    city: form.city.trim(),
    description: form.description.trim(),
    address: form.address.trim(),
    state: normalizeState(form.state),
    country: form.country.trim() || "USA",
    zip_code: form.zip_code.trim(),
    contact_phone: form.contact_phone.trim(),
    contact_email: form.contact_email.trim(),
    website: form.website.trim(),
    hours: parseHoursInput(form.hours),
    photos: textToArray(form.photos),
    price_tier: form.price_tier || "$$",
    keywords: textToArray(form.keywords),
  };
}

export function mergeRestaurants(...groups) {
  const seen = new Set();
  const merged = [];

  groups.flat().forEach((restaurant, index) => {
    const item = normalizeRestaurant(restaurant, `merged-${index}`);
    const key = String(item.id);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(item);
  });

  return merged;
}

export function getRestaurantImage(restaurant) {
  const cuisine = restaurant?.cuisine || restaurant?.cuisine_type || "";
  const localPhoto = restaurant?.photos?.[0];
  if (localPhoto) return localPhoto;

  const images = {
    Italian:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=80",
    Japanese:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80",
    Indian:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    Mexican:
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80",
    American:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  };

  return images[cuisine] || "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80";
}
