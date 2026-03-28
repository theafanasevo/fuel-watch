/**
 * src/types/analysis.ts
 *
 * Shared TypeScript definitions for price analysis, golden hour detection,
 * and weekly trend data used across the Fuel-Watch application.
 */

/**
 * Describes the human-friendly rating buckets produced by the scoring algorithm.
 * - "GreatDeal" for very good deals
 * - "FairPrice" for moderately good prices
 * - "Expensive" for above-average prices
 */
export type ScoreRating = "GreatDeal" | "FairPrice" | "Expensive";

/**
 * PriceScore
 *
 * Represents the computed score for a single station's price compared to
 * the area's daily average.
 */
export interface PriceScore {
  /**
   * Numeric score in the range 0-100 where higher is better.
   */
  score: number;

  /**
   * Bucketed, human-readable rating derived from `score`.
   */
  rating: ScoreRating;

  /**
   * Difference in Euros between the station's current price and the area's
   * daily average. (currentPrice - dailyAreaAverage)
   *
   * Can be negative when the station is cheaper than the average.
   */
  differenceEur: number;

  /**
   * Optional explanatory message or localization key describing why the
   * score was assigned (e.g. "savings of 12 cents vs. daily average").
   */
  explanation?: string;
}

/**
 * TimeWindow
 *
 * Represents a named time window (in local 24h time) and the expected saving
 * range observed in that window (in Euro cents).
 */
export interface TimeWindow {
  /**
   * Unique identifier key for the window (e.g. "ABSOLUTE_CHEAPEST").
   */
  key: string;

  /**
   * Short human-readable label for the window. This should be resolved via
   * the i18n layer when shown in the UI.
   */
  label: string;

  /**
   * Inclusive start hour of the window in local 24-hour time (0-23).
   */
  startHour: number;

  /**
   * Exclusive end hour of the window in local 24-hour time (1-24).
   */
  endHour: number;

  /**
   * Expected saving range for this window expressed in Euro cents.
   * - `min` and `max` are whole numbers representing cents (e.g. 12 means €0.12).
   */
  expectedSavingCents: {
    /**
     * Minimum expected saving in Euro cents.
     */
    min: number;

    /**
     * Maximum expected saving in Euro cents.
     */
    max: number;
  };
}

/**
 * GoldenHourResult
 *
 * The result of running golden-hour analysis for the current timestamp and
 * context (area/favorites). Contains all known windows and which (if any) is
 * currently active or upcoming.
 */
export interface GoldenHourResult {
  /**
   * All known time windows relevant to the domain (ordered or unordered).
   */
  windows: TimeWindow[];

  /**
   * The currently active time window, or `null` if none is active.
   */
  currentWindow?: TimeWindow | null;

  /**
   * The next upcoming time window, or `null` if none is upcoming today.
   */
  nextWindow?: TimeWindow | null;

  /**
   * Convenience boolean indicating whether now is within a "golden" window.
   */
  isGoldenNow: boolean;
}

/**
 * WeekdayName
 *
 * Canonical weekday names used throughout the app and trend datasets.
 */
export type WeekdayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

/**
 * TrendDay
 *
 * Represents a single day in the weekly trend dataset with its representative
 * average fuel price.
 */
export interface TrendDay {
  /**
   * Weekday name for this datapoint (Sunday - Saturday).
   */
  weekday: WeekdayName;

  /**
   * Representative average price for the day in Euro (e.g. 1.459).
   */
  averagePriceEur: number;
}

/**
 * WeeklyTrend
 *
 * Aggregated weekly trend dataset used by the TrendChart component and
 * price analysis utilities.
 */
export interface WeeklyTrend {
  /**
   * Ordered list of seven TrendDay records starting from Sunday through Saturday.
   */
  days: TrendDay[];

  /**
   * Subset of weekday names considered the historically cheapest days.
   * Example: ['Sunday', 'Monday']
   */
  cheapestDays: WeekdayName[];

  /**
   * Optional human-readable short citation or source identifier (e.g. "ADAC 2026").
   */
  source?: string;
}
