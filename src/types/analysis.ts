/**
 * src/types/analysis.ts
 *
 * Shared TypeScript definitions for price analysis, golden hour detection,
 * and weekly trend data used across the Fuel-Watch application. // file purpose
 */ // end file comment

/**
 * Describes the human-friendly rating buckets produced by the scoring algorithm.
 * - "GreatDeal" for very good deals
 * - "FairPrice" for moderately good prices
 * - "Expensive" for above-average prices
 */
export type ScoreRating = "GreatDeal" | "FairPrice" | "Expensive"; // rating union

/**
 * PriceScore
 *
 * Represents the computed score for a single station's price compared to
 * the area's daily average.
 */
export interface PriceScore {
  // start interface
  /**
   * Numeric score in the range 0-100 where higher is better.
   */
  score: number; // numeric score

  /**
   * Bucketed, human-readable rating derived from `score`.
   */
  rating: ScoreRating; // rating value

  /**
   * Difference in Euros between the station's current price and the area's
   * daily average. (currentPrice - dailyAreaAverage)
   *
   * Can be negative when the station is cheaper than the average.
   */
  differenceEur: number; // difference in euros

  /**
   * Optional explanatory message or localization key describing why the
   * score was assigned (e.g. "savings of 12 cents vs. daily average").
   */
  explanation?: string; // optional explanation key/text
} // end PriceScore

/**
 * TimeWindow
 *
 * Represents a named time window (in local 24h time) and the expected saving
 * range observed in that window (in Euro cents).
 */
export interface TimeWindow {
  // start TimeWindow
  /**
   * Unique identifier key for the window (e.g. "ABSOLUTE_CHEAPEST").
   */
  key: string; // window key

  /**
   * Short human-readable label for the window. This should be resolved via
   * the i18n layer when shown in the UI.
   */
  label: string; // label text or i18n key

  /**
   * Inclusive start hour of the window in local 24-hour time (0-23).
   */
  startHour: number; // start hour

  /**
   * Exclusive end hour of the window in local 24-hour time (1-24).
   */
  endHour: number; // end hour

  /**
   * Expected saving range for this window expressed in Euro cents.
   * - `min` and `max` are whole numbers representing cents (e.g. 12 means €0.12).
   */
  expectedSavingCents: {
    // start expectedSavingCents
    /**
     * Minimum expected saving in Euro cents.
     */
    min: number; // minimum cents

    /**
     * Maximum expected saving in Euro cents.
     */
    max: number; // maximum cents
  }; // end expectedSavingCents
} // end TimeWindow

/**
 * DataSource
 *
 * Describes the origin of the time-window savings estimate.
 * - "adac_default" = static ADAC dataset
 * - "observed" = derived from user-observed price samples
 */
export type DataSource = "adac_default" | "observed"; // data sources

/**
 * TimeWindowSavings
 *
 * Rich savings metadata used in hybrid analysis that combines ADAC defaults
 * with observed data when available.
 */
export interface TimeWindowSavings {
  // start TimeWindowSavings
  /**
   * Minimum expected saving in euro-cents per liter (can be negative).
   */
  min: number; // min cents

  /**
   * Maximum expected saving in euro-cents per liter (can be negative).
   */
  max: number; // max cents

  /**
   * Source of this estimate: 'adac_default' or 'observed'.
   */
  source: DataSource; // source enum

  /**
   * Number of observations used to compute the observed savings.
   * Zero for ADAC defaults.
   */
  observationCount: number; // count of observations
} // end TimeWindowSavings

/**
 * PriceObservation
 *
 * Represents a single observed price sample collected from user searches.
 */
export interface PriceObservation {
  // start PriceObservation
  /**
   * Observed price in EUR per liter.
   */
  price: number; // price in EUR

  /**
   * Local hour (0-23) when the observation was recorded.
   */
  hour: number; // local hour

  /**
   * Epoch milliseconds timestamp when the observation was recorded.
   */
  timestamp: number; // epoch ms
} // end PriceObservation

/**
 * GoldenHourResult
 *
 * The result of running golden-hour analysis for the current timestamp and
 * context (area/favorites). Contains all known windows and which (if any) is
 * currently active or upcoming.
 *
 * Extended to support hybrid savings data (ADAC default + observed).
 */
export interface GoldenHourResult {
  // start GoldenHourResult
  /**
   * All known time windows relevant to the domain (ordered or unordered).
   */
  windows: TimeWindow[]; // array of windows

  /**
   * The currently active time window, or `null` if none is active.
   */
  currentWindow?: TimeWindow | null; // current window

  /**
   * The next upcoming time window, or `null` if none is upcoming today.
   */
  nextWindow?: TimeWindow | null; // next window

  /**
   * Convenience boolean indicating whether now is within a "golden" window.
   */
  isGoldenNow: boolean; // boolean flag

  /**
   * Hybrid savings estimate for the current window expressed as TimeWindowSavings.
   * This contains min/max (cents), the source (adac_default|observed) and
   * the observation count used when source === 'observed'.
   */
  savings: TimeWindowSavings; // savings metadata

  /**
   * Confidence level of the savings estimate:
   * - 'low' for ADAC defaults or very few observations
   * - 'medium' for a moderate observation count
   * - 'high' for a robust observed dataset
   */
  confidence: "low" | "medium" | "high"; // confidence level
} // end GoldenHourResult

/**
 * WeekdayName
 *
 * Canonical weekday names used throughout the app and trend datasets.
 */
export type WeekdayName = // WeekdayName union
  | "Sunday" // Sunday
  | "Monday" // Monday
  | "Tuesday" // Tuesday
  | "Wednesday" // Wednesday
  | "Thursday" // Thursday
  | "Friday" // Friday
  | "Saturday"; // Saturday

/**
 * WeekdayKey
 *
 * Short weekday keys used by the weekly trend utilities and UI slices.
 */
export type WeekdayKey = // short keys
  | "sun" // Sunday key
  | "mon" // Monday key
  | "tue" // Tuesday key
  | "wed" // Wednesday key
  | "thu" // Thursday key
  | "fri" // Friday key
  | "sat"; // Saturday key

/**
 * TrendDay
 *
 * Represents a single day in the weekly trend dataset with metadata used by
 * the TrendChart component and accessibility labels.
 *
 * Fields:
 * - `day` short key ("mon", "tue", ...)
 * - `labelKey` i18n lookup key for the day's label
 * - `averagePriceOffset` integer cents relative to weekly average (e.g. -3)
 * - `isToday` boolean indicating whether this day is the current local day
 * - `isCheapest` boolean indicating historically cheapest day
 * - `isMostExpensive` boolean indicating historically most expensive day
 */
export interface TrendDay {
  // start TrendDay
  /** short key for the weekday */
  day: WeekdayKey; // day key

  /** i18n label lookup key for UI rendering */
  labelKey: string; // label i18n key

  /** price offset in Euro-cents relative to weekly average */
  averagePriceOffset: number; // offset in cents

  /** whether this represents today's weekday in local time */
  isToday: boolean; // is today

  /** whether this day is flagged as historically one of the cheapest */
  isCheapest: boolean; // cheapest flag

  /** whether this day is flagged as historically most expensive */
  isMostExpensive: boolean; // most expensive flag
} // end TrendDay

/**
 * WeeklyTrend
 *
 * Aggregated weekly trend dataset used by the TrendChart component and
 * price analysis utilities.
 *
 * Fields:
 * - `days`: readonly ordered list of seven TrendDay records starting from Monday
 *   through Sunday or another canonical order (consumer should rely on `day` keys)
 * - `cheapestDays`: readonly list of WeekdayKey entries considered cheapest
 * - `mostExpensiveDays`: readonly list of WeekdayKey entries considered most expensive
 * - `source`: citation string (e.g. "ADAC 2026")
 * - `lastUpdated`: ISO 8601 timestamp string for when the dataset was last updated
 */ //
export interface WeeklyTrend {
  // start WeeklyTrend
  /** ordered, readonly array of TrendDay records */
  readonly days: readonly TrendDay[]; // days array

  /** readonly keys for historically cheapest days */
  readonly cheapestDays: readonly WeekdayKey[]; // cheapest keys

  /** readonly keys for historically most expensive days */
  readonly mostExpensiveDays: readonly WeekdayKey[]; // most expensive keys

  /** must be the literal string "adac_2026" */
  source: "adac_2026";

  /** ISO 8601 timestamp when this dataset was last updated */
  lastUpdated: string; // last updated ISO string
} // end WeeklyTrend
