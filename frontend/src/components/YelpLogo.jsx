import { useMemo, useState } from "react";

function YelpLogo({ size = 64, centered = true, showText = true }) {
  const [fallback, setFallback] = useState(false);

  const fontSize = useMemo(() => {
    if (size >= 60) return "1.9rem";
    if (size >= 44) return "1.35rem";
    return "1rem";
  }, [size]);

  return (
    <div
      className={`d-flex align-items-center gap-2 ${centered ? "justify-content-center" : ""}`}
    >
      {fallback ? (
        <div
          className="logo-fallback"
          style={{ width: size, height: size, fontSize: Math.max(18, size / 2.5) }}
          aria-label="Yelp"
        >
          ✦
        </div>
      ) : (
        <img
          src="/yelp-logo.png"
          alt="Yelp Logo"
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          onError={(event) => {
            if (event.currentTarget.src.endsWith("/yelp-logo.svg")) {
              setFallback(true);
              return;
            }
            event.currentTarget.src = "/yelp-logo.svg";
          }}
        />
      )}

      {showText && (
        <span className="fw-bold" style={{ color: "#d32323", fontSize, lineHeight: 1 }}>
          Yelp
        </span>
      )}
    </div>
  );
}

export default YelpLogo;
