/**
 * Dashboard component.
 * Main results layout that combines SearchForm, StationCard list,
 * TrendChart, golden hour info, and loading/error states.
 */

import { useState, useCallback, type ReactNode } from "react"; // React hooks and types
import type { Coordinates } from "../../types/geo"; // Coordinates type
import type { FuelType } from "../../types/fuel"; // FuelType type
import type { TankerStation } from "../../types/fuel"; // Station type
import { useTranslation } from "../../hooks/useTranslation"; // Translation hook
import { useFuelStations } from "../../hooks/useFuelStations"; // Stations hook
import { usePriceAnalysis } from "../../hooks/usePriceAnalysis"; // Analysis hook
import { SearchForm } from "../SearchForm"; // Search form component
import { StationCard } from "../StationCard"; // Station card component
import { TrendChart } from "../TrendChart"; // Trend chart component
import { Spinner } from "../Spinner"; // Loading spinner
import { Skeleton } from "../Skeleton"; // Loading placeholder
import { ErrorMessage } from "../ErrorMessage"; // Error display
import { formatPrice } from "../../utils/formatPrice"; // Price formatter
import "./Dashboard.css"; // Co-located styles

/**
 * Renders the main dashboard layout.
 * Manages search state, displays station results,
 * golden hour analysis, and weekly trend chart.
 * @returns The dashboard element.
 */
export function Dashboard(): ReactNode {
  const { t } = useTranslation(); // Translation function
  const {
    stations, // Station results array
    loading, // Loading state
    error, // Error message
    fetchStations, // Fetch function
  } = useFuelStations();

  const {
    goldenHour, // Golden hour analysis
    todayTrend, // Today's trend data
    isCheapToday, // Whether today is cheap
    getStationScore, // Score calculator
  } = usePriceAnalysis();

  const [activeFuelType, setActiveFuelType] = useState<FuelType>("e5"); // Track active fuel type
  const [hasSearched, setHasSearched] = useState(false); // Track if user has searched

  /**
   * Handles search form submission.
   * Calls fetchStations with user-selected parameters.
   */
  const handleSearch = useCallback(
    (params: {
      coordinates: Coordinates;
      fuelType: FuelType;
      radius: number;
    }): void => {
      setActiveFuelType(params.fuelType); // Store active fuel type
      setHasSearched(true); // Mark as searched
      fetchStations(
        params.coordinates.lat, // Latitude
        params.coordinates.lon, // Longitude
        params.radius, // Radius in km
        params.fuelType, // Fuel type filter
      );
    },
    [fetchStations],
  );

  /**
   * Calculates the daily average price from all stations.
   * Used for score calculation.
   * @param stationList - Array of stations.
   * @param fuelType - Active fuel type.
   * @returns Average price or null if no prices available.
   */
  const calculateDailyAverage = (
    stationList: readonly TankerStation[],
    fuelType: FuelType,
  ): number | null => {
    const prices = stationList
      .map((s) => {
        const direct = s[fuelType]; // Direct property access
        if (typeof direct === "number") return direct; // Use direct price
        return s.prices?.[fuelType] ?? null; // Fallback to map
      })
      .filter((p): p is number => p !== null); // Filter out nulls

    if (prices.length === 0) return null; // No prices available

    return prices.reduce((sum, p) => sum + p, 0) / prices.length; // Calculate mean
  };

  /** Daily average for score calculation. */
  const dailyAverage = calculateDailyAverage(stations, activeFuelType);

  /**
   * Gets score for a station based on current price vs daily average.
   * @param station - The station to score.
   * @returns Numeric score or null if price unavailable.
   */
  const getScore = (station: TankerStation): number | null => {
    const price = station.prices?.[activeFuelType] ?? null; // Get station price
    if (price === null || dailyAverage === null) return null; // Can't score without data
    return getStationScore(price, dailyAverage).score; // Calculate and return score
  };

  /** Extracts price from station for sorting. */
  const extractPrice = (s: TankerStation): number => {
    const direct = s[activeFuelType]; // Check direct property
    if (typeof direct === "number") return direct; // Use direct price
    return s.prices?.[activeFuelType] ?? Infinity; // Fallback or Infinity
  };

  const sortedStations = [...stations].sort((a, b) => {
    return extractPrice(a) - extractPrice(b); // Sort cheapest first
  });

  return (
    <div className="dashboard">
      {/* ── Search Section ── */}
      <section className="dashboard__search" aria-label={t("search.button")}>
        <SearchForm onSearch={handleSearch} /> {/* Search form */}
      </section>

      {/* ── Golden Hour Banner ── */}
      {goldenHour.isGoldenNow && (
        <section
          className="dashboard__golden-hour fade-in"
          aria-label={t("analysis.goldenHourTitle")}
        >
          <div className="dashboard__golden-hour-content">
            <h2 className="dashboard__golden-hour-title">
              {t("analysis.goldenHourTitle")} {/* Golden hour heading */}
            </h2>
            <p className="dashboard__golden-hour-desc">
              {t("analysis.goldenHourDesc")} {/* Golden hour description */}
            </p>
          </div>
        </section>
      )}

      {/* ── Today's Trend Tip ── */}
      {isCheapToday && !goldenHour.isGoldenNow && (
        <section
          className="dashboard__today-tip fade-in"
          aria-label={t("analysis.cheapestDay")}
        >
          <p className="dashboard__today-tip-text">
            {t("analysis.cheapestDay")} {/* Cheap day note */}
          </p>
        </section>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <section className="dashboard__loading" aria-label={t("a11y.loading")}>
          <Spinner size="lg" label={t("a11y.loading")} /> {/* Large spinner */}
          <div className="dashboard__skeletons">
            <Skeleton variant="card" /> {/* Card placeholder 1 */}
            <Skeleton variant="card" /> {/* Card placeholder 2 */}
            <Skeleton variant="card" /> {/* Card placeholder 3 */}
          </div>
        </section>
      )}

      {/* ── Error State ── */}
      {error && !loading && (
        <ErrorMessage
          title={t("errors.apiError")} // Error title
          message={error} // Error details
          actionLabel={t("errors.retry")} // Retry button text
          onAction={() => setHasSearched(false)} // Reset search state
        />
      )}

      {/* ── Results ── */}
      {!loading && !error && hasSearched && (
        <section
          className="dashboard__results fade-in" // Results section
          aria-label={t("a11y.resultsAnnouncement", {
            count: String(stations.length), // Station count
            price: "", // Filled by aria-live
          })}
        >
          {sortedStations.length > 0 ? (
            <>
              {/* Results header */}
              <h2 className="dashboard__results-title">
                {t("a11y.resultsAnnouncement", {
                  count: String(stations.length), // Total count
                  price: sortedStations[0][activeFuelType]
                    ? String(formatPrice(sortedStations[0][activeFuelType]))
                    : "", // Cheapest price
                })}
              </h2>

              {/* Station cards grid */}
              <div className="dashboard__stations-grid">
                {sortedStations.map((station) => (
                  <StationCard
                    key={station.id} // Unique key per station
                    station={station} // Station data
                    fuelType={activeFuelType} // Active fuel type
                    score={getScore(station)} // Calculated score
                  />
                ))}
              </div>
            </>
          ) : (
            /* No results message */
            <div className="dashboard__empty fade-in">
              <p className="dashboard__empty-text">
                {t("search.noResults")} {/* No stations found */}
              </p>
              <button
                className="dashboard__expand-button" // Expand search button
                type="button" // Explicit button type
                onClick={() => setHasSearched(false)} // Reset to search again
              >
                {t("search.expandSearch")} {/* Expand search text */}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── Weekly Trend Chart ── */}
      <section className="dashboard__trends">
        <TrendChart /> {/* Weekly trend visualization */}
      </section>
    </div>
  );
}
