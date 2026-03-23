const BUDGET_PATTERNS = {
  cheap: /(cheap|budget|affordable|low cost|inexpensive)/i,
  moderate: /(moderate|mid range|mid-range|medium price|average price)/i,
  expensive: /(expensive|fine dining|premium|luxury|high end|high-end)/i,
};

function normalizeRestaurant(restaurant) {
  return {
    ...restaurant,
    name: String(restaurant?.name || "").trim(),
    city: String(restaurant?.city || "").trim(),
    cuisine: String(restaurant?.cuisine_type || restaurant?.cuisine || "").trim(),
    priceTier: String(restaurant?.price_tier || restaurant?.price || "").trim(),
    description: String(restaurant?.description || "").trim(),
    keywords: Array.isArray(restaurant?.keywords) ? restaurant.keywords : [],
    rating: Number(restaurant?.rating || restaurant?.avg_rating || restaurant?.average_rating || 0),
  };
}

function getKnownValues(restaurants) {
  const normalized = (restaurants || []).map(normalizeRestaurant);

  const cuisines = [
    ...new Set(normalized.map((restaurant) => restaurant.cuisine.toLowerCase()).filter(Boolean)),
  ];

  const cities = [
    ...new Set(normalized.map((restaurant) => restaurant.city.toLowerCase()).filter(Boolean)),
  ];

  return { cuisines, cities, normalized };
}

function extractIntent(message, restaurants) {
  const text = String(message || "").toLowerCase().trim();
  const { cuisines, cities } = getKnownValues(restaurants);

  const cuisine = cuisines.find((value) => text.includes(value)) || null;
  const city = cities.find((value) => text.includes(value)) || null;

  let budget = null;
  if (BUDGET_PATTERNS.cheap.test(text)) budget = "cheap";
  else if (BUDGET_PATTERNS.moderate.test(text)) budget = "moderate";
  else if (BUDGET_PATTERNS.expensive.test(text)) budget = "expensive";

  return { text, cuisine, city, budget };
}

function budgetMatches(restaurant, budget) {
  if (!budget) return true;

  const price = String(restaurant?.priceTier || "").toLowerCase();

  if (budget === "cheap") {
    return price === "$" || price.includes("cheap") || price.includes("budget") || price.includes("affordable");
  }

  if (budget === "moderate") {
    return price === "$$" || price.includes("moderate") || price.includes("medium");
  }

  if (budget === "expensive") {
    return (
      price === "$$$" ||
      price === "$$$$" ||
      price.includes("expensive") ||
      price.includes("premium") ||
      price.includes("luxury")
    );
  }

  return true;
}

function rankMatches(message, restaurants) {
  const tokens = String(message || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  return restaurants
    .map((restaurant) => {
      const searchBlob = [
        restaurant.name,
        restaurant.city,
        restaurant.cuisine,
        restaurant.description,
        ...(restaurant.keywords || []),
      ]
        .join(" ")
        .toLowerCase();

      const score = tokens.reduce((sum, token) => sum + (searchBlob.includes(token) ? 1 : 0), 0);

      return { restaurant, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.restaurant.rating - a.restaurant.rating)
    .map((item) => item.restaurant);
}

export function buildFallbackReply(message, restaurants) {
  if (!restaurants || restaurants.length === 0) {
    return "I do not have restaurant data right now. Please try again in a moment.";
  }

  const text = String(message || "").toLowerCase().trim();

  if (text.includes("favorite")) {
    return "You can save favorite restaurants from the restaurant cards or from the restaurant details page.";
  }

  if (text.includes("add restaurant")) {
    return "Use the Add Restaurant page or the Owner Dashboard to create a new restaurant listing.";
  }

  const { cuisine, city, budget } = extractIntent(message, restaurants);
  const normalized = restaurants.map(normalizeRestaurant);

  let matches = normalized.filter((restaurant) => {
    const cuisineOk = cuisine ? restaurant.cuisine.toLowerCase().includes(cuisine) : true;
    const cityOk = city ? restaurant.city.toLowerCase().includes(city) : true;
    const budgetOk = budget ? budgetMatches(restaurant, budget) : true;
    return cuisineOk && cityOk && budgetOk;
  });

  if (!matches.length && cuisine) {
    matches = normalized.filter((restaurant) => restaurant.cuisine.toLowerCase().includes(cuisine));
  }

  if (!matches.length && city) {
    matches = normalized.filter((restaurant) => restaurant.city.toLowerCase().includes(city));
  }

  if (!matches.length) {
    matches = rankMatches(message, normalized);
  }

  matches.sort((a, b) => b.rating - a.rating);

  if (!matches.length) {
    return 'I could not find a strong match. Try asking something like "Indian in Sunnyvale", "cheap food", or "Japanese restaurants".';
  }

  const top = matches[0];
  const ratingText = top.rating ? top.rating.toFixed(1) : "N/A";

  if (cuisine && city) {
    return `Sure — ${top.name} is a good ${top.cuisine} option in ${top.city}. Its rating is about ${ratingText}.`;
  }

  if (cuisine) {
    return `Sure — ${top.name} is a good ${top.cuisine} restaurant in ${top.city}. Its rating is about ${ratingText}.`;
  }

  if (city) {
    return `A good option in ${top.city} is ${top.name}. It serves ${top.cuisine} and is rated about ${ratingText}.`;
  }

  if (budget) {
    return `A ${budget} option you may like is ${top.name} in ${top.city}. It serves ${top.cuisine} and is rated about ${ratingText}.`;
  }

  return `You could start with ${top.name} in ${top.city}. It serves ${top.cuisine} and is rated about ${ratingText}.`;
}
