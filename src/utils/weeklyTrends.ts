/**
 * Static weekly trend utilities based on ADAC 2026 data.
 */

import type { TrendDay, WeeklyTrend, WeekdayKey } from "../types/analysis"; // import shared types

// Canonical weekday order from Sunday
const WEEKDAY_ORDER: readonly WeekdayKey[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

// Map of offsets in euro-cents (relative to weekly average)
const ADAC_OFFSETS_CENTS: Readonly<Record<WeekdayKey, number>> = Object.freeze({
  sun: -3,
  mon: -3,
  tue: -1,
  wed: 1,
  thu: 2,
  fri: 3,
  sat: 1,
});

// Historically cheapest days per ADAC 2026
const CHEAPEST_DAYS: readonly WeekdayKey[] = Object.freeze(["sun", "mon"]);

// Historically most expensive day per ADAC 2026
const MOST_EXPENSIVE_DAYS: readonly WeekdayKey[] = Object.freeze(["fri"]);

/**
 * getDayOfWeek
 *
 * Return the current local weekday as a short key: 'sun' | 'mon' | ... | 'sat'.
 * @returns {WeekdayKey} current short weekday key
 */
export function getDayOfWeek(): WeekdayKey {
  const idx: number = new Date().getDay(); // use local Date to determine weekday index
  return WEEKDAY_ORDER[idx]; // map numeric index to short key and return
}

/**
 * getWeeklyTrendData
 *
 * Build a WeeklyTrend object using ADAC 2026 static offsets and metadata.
 * @returns {WeeklyTrend} immutable weekly trend dataset including per-day flags
 */
export function getWeeklyTrendData(): WeeklyTrend {
  const todayKey: WeekdayKey = getDayOfWeek(); // compute today's short key
  const days: TrendDay[] = WEEKDAY_ORDER.map((key) => ({
    day: key,
    labelKey: `days.${key}`, // fixed: use "days.${key}" for i18n lookup
    averagePriceOffset: ADAC_OFFSETS_CENTS[key],
    isToday: key === todayKey,
    isCheapest: CHEAPEST_DAYS.includes(key),
    isMostExpensive: MOST_EXPENSIVE_DAYS.includes(key),
  }));

  const result: WeeklyTrend = {
    days: Object.freeze(days),
    cheapestDays: CHEAPEST_DAYS,
    mostExpensiveDays: MOST_EXPENSIVE_DAYS,
    source: "adac_2026", // fixed: use literal "adac_2026" string
    lastUpdated: "2026-01-15", // fixed: use static date string
  };

  return result;
}

/**
 * getTodayTrend
 *
 * Return the TrendDay entry representing the current local day.
 * @returns {TrendDay} trend metadata for today
 * @throws {Error} throws locale-compatible error key if today's entry cannot be found
 */
export function getTodayTrend(): TrendDay {
  const weekly: WeeklyTrend = getWeeklyTrendData();
  const today: TrendDay | undefined = weekly.days.find((d) => d.isToday);
  if (today === undefined) {
    throw new Error("weeklyTrend_error_no_today");
  }
  return today;
}

/**
 * isCheapDay
 *
 * Predicate that returns true if the provided short weekday key (or today when omitted) is historically a cheap day according to ADAC 2026.
 * @param {WeekdayKey | undefined} day optional short weekday key; defaults to today
 * @returns {boolean} true when the day is one of the historically cheapest days
 */
export function isCheapDay(day?: WeekdayKey): boolean {
  const key: WeekdayKey = day ?? getDayOfWeek();
  return CHEAPEST_DAYS.includes(key);
}

/**
 * getPriceOffsetForDay
 *
 * Lookup the ADAC 2026 price offset (in euro-cents) for the supplied short weekday key.
 * @param {WeekdayKey} day the short weekday key to query (required)
 * @returns {number} integer offset in euro-cents relative to weekly average
 */
export function getPriceOffsetForDay(day: WeekdayKey): number {
  return ADAC_OFFSETS_CENTS[day];
}
