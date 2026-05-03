/**
 * TrendChart component.
 * Displays a pure CSS bar chart of weekly fuel price trends
 * based on ADAC 2026 static data.
 */

import { useMemo, type ReactNode } from "react"; // React hooks and types
import type { TrendDay } from "../../types/analysis"; // TrendDay type
import { useTranslation } from "../../hooks/useTranslation"; // Translation hook
import { getWeeklyTrendData } from "../../utils/weeklyTrends"; // Weekly trend data
import "./TrendChart.css"; // Co-located styles

/** Maximum absolute offset value for scaling bar heights. */
const MAX_OFFSET = 3; // Max cents offset (used to normalize bar height)

/**
 * Calculates bar height percentage from offset value.
 * Maps offset range [-MAX..+MAX] to [0%..100%] visual height.
 * @param offset - Price offset in euro-cents.
 * @returns Percentage string for CSS height.
 */
function getBarHeight(offset: number): string {
  const normalized = (Math.abs(offset) / MAX_OFFSET) * 100; // Normalize to 0-100
  return `${Math.max(normalized, 15)}%`; // Minimum 15% for visibility
}

/**
 * Determines the CSS modifier class for a trend day bar.
 * @param day - The trend day data.
 * @returns BEM modifier string.
 */
function getBarModifier(day: TrendDay): string {
  if (day.isCheapest) return "trend-chart__bar--cheapest"; // Green for cheapest
  if (day.isMostExpensive) return "trend-chart__bar--expensive"; // Red for expensive
  return ""; // Default bar color
}

/**
 * Renders a pure CSS bar chart showing weekly price trends.
 * Each bar represents a day's price offset from the weekly average.
 * @returns The trend chart element.
 */
export function TrendChart(): ReactNode {
  const { t } = useTranslation(); // Get translation function
  const trendData = useMemo(() => getWeeklyTrendData(), []); // Memoize static data

  return (
    <section
      className="trend-chart fade-in" // BEM block + entrance animation
      aria-label={t("a11y.trendChart")} // Accessible chart description
    >
      {/* ── Chart Header ── */}
      <div className="trend-chart__header">
        <h3 className="trend-chart__title">
          {t("analysis.trendTitle")} {/* Chart title */}
        </h3>
        <p className="trend-chart__desc">
          {t("analysis.trendDesc")} {/* Chart description */}
        </p>
      </div>

      {/* ── Bar Chart ── */}
      <div
        className="trend-chart__chart" // Chart container
        role="img" // Treat as image for screen readers
        aria-hidden="true" // Bars are decorative, description is above
      >
        {trendData.days.map((day) => (
          <div
            key={day.day} // Unique key per day
            className={`trend-chart__column ${
              day.isToday ? "trend-chart__column--today" : "" // Highlight today
            }`}
          >
            {/* Offset label above bar */}
            <span className="trend-chart__offset">
              {day.averagePriceOffset > 0 ? "+" : ""}
              {day.averagePriceOffset} {/* Signed offset */}
            </span>

            {/* Bar visual */}
            <div className="trend-chart__bar-container">
              <div
                className={`trend-chart__bar ${getBarModifier(day)}`} // Bar with modifier
                style={{ height: getBarHeight(day.averagePriceOffset) }} // Dynamic height
              />
            </div>

            {/* Day label */}
            <span className="trend-chart__day-label">
              {t(day.labelKey)} {/* Translated day name */}
            </span>

            {/* Today indicator */}
            {day.isToday && (
              <span className="trend-chart__today-badge">
                {t("analysis.today")} {/* "Today" label */}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Chart Footer ── */}
      <p className="trend-chart__footnote">
        {t("analysis.cheapestDay")} {/* Cheapest days note */}
      </p>
    </section>
  );
}
