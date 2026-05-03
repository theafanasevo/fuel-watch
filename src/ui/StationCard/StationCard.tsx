/**
 * StationCard component.
 * Displays a fuel station's info, price, score badge,
 * distance, status, and favorite toggle.
 * Uses semantic <article> element as required by .rules.
 */

import { type ReactNode } from "react"; // React hooks and types
import type { TankerStation } from "../../types/fuel"; // Station type
import type { FuelType } from "../../types/fuel"; // Fuel type
import { useTranslation } from "../../hooks/useTranslation"; // Translation hook
import { useFavorites } from "../../hooks/useFavorites"; // Favorites hook
import {
  formatPrice,
  formatPriceForScreenReader,
} from "../../utils/formatPrice"; // Price formatters
import { formatDistance } from "../../utils/formatDistance"; // Distance formatter
import { ScoreBadge } from "../ScoreBadge"; // Score badge component
import "./StationCard.css"; // Co-located styles

/** Props interface for the StationCard component. */
interface StationCardProps {
  station: TankerStation; // Station data object
  fuelType: FuelType; // Currently selected fuel type
  score?: number | null; // Optional price score (0-100)
}

/**
 * Resolves the price for the selected fuel type from station data.
 * Checks both direct properties (API response) and prices map.
 * @param station - The station object.
 * @param fuelType - The selected fuel type.
 * @returns Price in EUR or null if unavailable.
 */
function getPrice(station: TankerStation, fuelType: FuelType): number | null {
  const directPrice = station[fuelType]; // Check direct property (e5, e10, diesel)
  if (typeof directPrice === "number") return directPrice; // Return if numeric price

  if (station.prices) {
    const mapPrice = station.prices[fuelType]; // Check prices map fallback
    if (typeof mapPrice === "number") return mapPrice; // Return if numeric price
  }

  return null; // No price available
}

/**
 * Builds a display address from station fields.
 * @param station - The station object.
 * @returns Formatted address string.
 */
function buildAddress(station: TankerStation): string {
  const street = [station.street, station.houseNumber]
    .filter(Boolean) // Remove nullish parts
    .join(" "); // Combine street + number

  const city = [station.postCode, station.place]
    .filter(Boolean) // Remove nullish parts
    .join(" "); // Combine PLZ + city

  return [street, city]
    .filter(Boolean) // Remove empty strings
    .join(", "); // Combine street line + city line
}

/**
 * Renders a fuel station card with price, score, distance,
 * open/closed status, and a favorite toggle button.
 * @param props - Station data, fuel type, and optional score.
 * @returns The station card element.
 */
export function StationCard({
  station, // Station data
  fuelType, // Active fuel type
  score, // Optional price score
}: StationCardProps): ReactNode {
  const { t, language } = useTranslation(); // Translation function and language
  const { checkIsFavorite, addFavorite, removeFavoriteById } = useFavorites(); // Favorites API

  const price = getPrice(station, fuelType); // Resolve current price
  const locale = language === "en" ? "en-GB" : "de-DE"; // Locale for formatters
  const address = buildAddress(station); // Build display address
  const favorited = checkIsFavorite(station.id); // Check favorite status
  const isOpen = station.isOpen ?? null; // Open status

  /** Station display name with brand fallback. */
  const displayName = station.name ?? station.brand ?? t("station.open"); // Fallback chain

  /** Screen reader label for the entire card. */
  const ariaLabel = t("a11y.stationCard", {
    name: displayName, // Station name
    fuel: t(`fuel.${fuelType}`), // Translated fuel type
    price: formatPriceForScreenReader(price, locale), // Spoken price
  });

  /**
   * Toggles favorite status for this station.
   * Constructs a FavoriteStation object when adding.
   */
  const handleFavoriteToggle = (): void => {
    if (favorited) {
      removeFavoriteById(station.id); // Remove from favorites
    } else {
      addFavorite({
        id: station.id, // Station unique ID
        addedAt: new Date().toISOString(), // Current timestamp
        label: displayName, // Station name for offline display
      }); // Add to favorites
    }
  };

  return (
    <article
      className="station-card fade-in" // BEM block + entrance animation
      aria-label={ariaLabel} // Full card context for screen readers
    >
      {/* ── Header: Name + Favorite ── */}
      <div className="station-card__header">
        <div className="station-card__identity">
          {/* Brand name */}
          {station.brand && (
            <span className="station-card__brand">
              {station.brand} {/* Station brand */}
            </span>
          )}

          {/* Station name */}
          <h3 className="station-card__name">
            {displayName} {/* Station display name */}
          </h3>

          {/* Address */}
          {address && (
            <p className="station-card__address">
              {address} {/* Formatted address */}
            </p>
          )}
        </div>

        {/* Favorite toggle button */}
        <button
          className={`station-card__favorite ${
            favorited ? "station-card__favorite--active" : "" // Active modifier
          }`}
          type="button" // Explicit button type
          onClick={handleFavoriteToggle} // Toggle handler
          aria-label={t("a11y.favoriteToggle", { name: displayName })} // Accessible label
          aria-pressed={favorited} // Toggle state
        >
          {favorited ? "♥" : "♡"} {/* Filled or outline heart */}
        </button>
      </div>

      {/* ── Body: Price + Score + Meta ── */}
      <div className="station-card__body">
        {/* Price display */}
        <div className="station-card__price-section">
          <span className="station-card__fuel-type">
            {t(`fuel.${fuelType}`)} {/* Translated fuel type label */}
          </span>
          <span
            className="station-card__price" // BEM element
            aria-hidden="true" // Hide visual price from SR
          >
            {formatPrice(price, locale)} {/* Formatted visual price */}
          </span>
          {/* Screen reader spoken price */}
          <span className="sr-only">
            {formatPriceForScreenReader(price, locale)}
          </span>
        </div>

        {/* Score badge */}
        {score !== null && score !== undefined && (
          <div className="station-card__score">
            <ScoreBadge score={score} /> {/* Score pill badge */}
          </div>
        )}
      </div>

      {/* ── Footer: Distance + Status ── */}
      <div className="station-card__footer">
        {/* Distance */}
        {station.dist !== null && station.dist !== undefined && (
          <span className="station-card__distance">
            {formatDistance(station.dist ? station.dist * 1000 : null, locale)}
          </span>
        )}

        {/* Open/Closed status */}
        {isOpen !== null && (
          <span
            className={`station-card__status ${
              isOpen
                ? "station-card__status--open"
                : "station-card__status--closed" // Status modifier
            }`}
          >
            {isOpen ? t("station.open") : t("station.closed")}{" "}
            {/* Translated status */}
          </span>
        )}
      </div>
    </article>
  );
}
