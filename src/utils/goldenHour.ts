/**
 * src/utils/goldenHour.ts
 *
 * Hybrid golden hour analysis that uses ADAC default windows and optionally
 * augments them with observed price data collected from user searches.
 *
 * Functions:
 * - isInTimeWindow(hour, window)
 * - getCurrentTimeWindow(hour)
 * - getDefaultSavings(windowName)
 * - calculateObservedSavings(observations, windowName)
 * - getConfidence(source, observationCount)
 * - analyzeGoldenHour(currentHour?, observations?)
 *
 * Notes:
 * - All savings are expressed in euro-cents (integer).
 * - Observed savings are derived from user price observations when enough data exists.
 */

import type {
  TimeWindow,
  GoldenHourResult,
  PriceObservation,
  TimeWindowSavings,
} from "../types/analysis"; // domain types
import { TIME_WINDOWS, OBSERVATION_THRESHOLDS } from "./constants"; // constants

/**
 * isInTimeWindow
 *
 * Determine whether a given hour (0-23) falls inside the provided TimeWindow.
 * Handles windows that cross midnight (startHour > endHour).
 *
 * @param hour - hour in local 24h (0-23)
 * @param window - object with startHour and endHour
 * @returns boolean - true when hour is inside the window (inclusive start, exclusive end)
 */
export function isInTimeWindow(
  hour: number,
  window: { startHour: number; endHour: number },
): boolean {
  const h = Math.floor(hour) % 24;
  const start = Math.floor(window.startHour) % 24;
  const end = Math.floor(window.endHour) % 24;

  // Non-wrapping window (e.g., 16 -> 22)
  if (start < end) {
    return h >= start && h < end;
  }

  // Wrapping window crossing midnight (e.g., 22 -> 4)
  return h >= start || h < end;
}

/**
 * getCurrentTimeWindow
 *
 * Determine which named window the provided hour falls into.
 * Order of checks:
 *  1. goldenHour (subset of eveningWindow) — must be checked first
 *  2. eveningWindow
 *  3. morningPeak
 *  4. normal
 *
 * @param hour - hour in local 24h (0-23)
 * @returns 'goldenHour' | 'eveningWindow' | 'morningPeak' | 'normal'
 */
export function getCurrentTimeWindow(
  hour: number,
): "goldenHour" | "eveningWindow" | "morningPeak" | "normal" {
  if (
    isInTimeWindow(hour, {
      startHour: TIME_WINDOWS.goldenHour.start,
      endHour: TIME_WINDOWS.goldenHour.end,
    })
  ) {
    return "goldenHour";
  }

  if (
    isInTimeWindow(hour, {
      startHour: TIME_WINDOWS.eveningWindow.start,
      endHour: TIME_WINDOWS.eveningWindow.end,
    })
  ) {
    return "eveningWindow";
  }

  if (
    isInTimeWindow(hour, {
      startHour: TIME_WINDOWS.morningPeak.start,
      endHour: TIME_WINDOWS.morningPeak.end,
    })
  ) {
    return "morningPeak";
  }

  return "normal";
}

/**
 * getDefaultSavings
 *
 * Return ADAC static savings for a named window as TimeWindowSavings.
 * Source is 'adac_default' and observationCount is 0.
 *
 * @param windowName - one of the recognized window names or 'normal'
 * @returns TimeWindowSavings - min/max in euro-cents, source and obs count
 */
export function getDefaultSavings(
  windowName: "goldenHour" | "eveningWindow" | "morningPeak" | "normal",
): TimeWindowSavings {
  switch (windowName) {
    case "goldenHour":
      return { min: 12, max: 17, source: "adac_default", observationCount: 0 };
    case "eveningWindow":
      return { min: 2, max: 4, source: "adac_default", observationCount: 0 };
    case "morningPeak":
      return { min: -8, max: -8, source: "adac_default", observationCount: 0 };
    case "normal":
    default:
      return { min: 0, max: 0, source: "adac_default", observationCount: 0 };
  }
}

/**
 * Helper: compute arithmetic mean of an array of numbers.
 *
 * @param arr - array of numbers
 * @returns mean (0 if empty)
 */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  const s = arr.reduce((a, b) => a + b, 0);
  return s / arr.length;
}

/**
 * Helper: compute standard deviation of array of numbers (population).
 *
 * @param arr - array of numbers
 * @returns standard deviation (0 if <2 items)
 */
function stddev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance =
    arr.reduce((acc, v) => acc + (v - m) * (v - m), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * calculateObservedSavings
 *
 * Try to derive savings for the named window from observed PriceObservation entries.
 * - Filters observations belonging to the specified hourly window.
 * - If filtered count >= OBSERVATION_THRESHOLDS.MIN_OBSERVATIONS_MEDIUM:
 *     compute observed average savings (overallAvg - windowAvg) and return observed TimeWindowSavings.
 * - Otherwise return ADAC defaults via getDefaultSavings.
 *
 * Savings are expressed in euro-cents (integers). We return a small range around
 * the mean observed saving using the observed stddev to provide min/max.
 *
 * @param observations - array of PriceObservation (may be undefined)
 * @param windowName - named window
 * @returns TimeWindowSavings
 */
export function calculateObservedSavings(
  observations: PriceObservation[] | undefined,
  windowName: "goldenHour" | "eveningWindow" | "morningPeak" | "normal",
): TimeWindowSavings {
  if (!observations || observations.length === 0) {
    return getDefaultSavings(windowName);
  }

  // Resolve start/end hours for the named window
  let startHour = 0;
  let endHour = 24;
  if (windowName === "goldenHour") {
    startHour = TIME_WINDOWS.goldenHour.start;
    endHour = TIME_WINDOWS.goldenHour.end;
  } else if (windowName === "eveningWindow") {
    startHour = TIME_WINDOWS.eveningWindow.start;
    endHour = TIME_WINDOWS.eveningWindow.end;
  } else if (windowName === "morningPeak") {
    startHour = TIME_WINDOWS.morningPeak.start;
    endHour = TIME_WINDOWS.morningPeak.end;
  } else {
    // 'normal' => treat as all-day window, but fallback will probably not be used
    startHour = 0;
    endHour = 24;
  }

  // Filter observations that belong to the window hours
  const inWindow = observations.filter((o) => {
    const h = Math.floor(o.hour) % 24;
    if (startHour < endHour) {
      return h >= startHour && h < endHour;
    }
    // crossing midnight
    return h >= startHour || h < endHour;
  });

  const obsCount = inWindow.length;

  // If not enough observations, fall back to defaults
  if (obsCount < OBSERVATION_THRESHOLDS.MIN_OBSERVATIONS_MEDIUM) {
    return getDefaultSavings(windowName);
  }

  // Compute average price inside window and overall average price across all observations
  const windowPrices = inWindow.map((o) => o.price);
  const allPrices = observations.map((o) => o.price);

  const avgWindow = mean(windowPrices);
  const avgAll = mean(allPrices);

  // Saving in EUR: overallAvg - windowAvg (positive => window cheaper)
  const savingEur = avgAll - avgWindow;
  const savingCents = Math.round(savingEur * 100);

  // For a range, use standard deviation of window prices as uncertainty (converted to cents)
  const sdCents = Math.round(stddev(windowPrices) * 100);
  // Ensure at least +/-1 cent range
  const variance = Math.max(1, sdCents);

  return {
    min: savingCents - variance,
    max: savingCents + variance,
    source: "observed",
    observationCount: obsCount,
  };
}

/**
 * getConfidence
 *
 * Map data source + observation count to confidence levels:
 * - adac_default -> 'low'
 * - observed with MIN_OBSERVATIONS_MEDIUM..MIN_OBSERVATIONS_HIGH-1 -> 'medium'
 * - observed with >= MIN_OBSERVATIONS_HIGH -> 'high'
 *
 * @param source - 'adac_default' | 'observed'
 * @param observationCount - count of observed samples used
 * @returns 'low' | 'medium' | 'high'
 */
export function getConfidence(
  source: "adac_default" | "observed",
  observationCount: number,
): "low" | "medium" | "high" {
  if (source === "adac_default") return "low";
  if (observationCount >= OBSERVATION_THRESHOLDS.MIN_OBSERVATIONS_HIGH)
    return "high";
  if (observationCount >= OBSERVATION_THRESHOLDS.MIN_OBSERVATIONS_MEDIUM)
    return "medium";
  return "low";
}

/**
 * analyzeGoldenHour
 *
 * Hybrid analysis combining ADAC defaults with observed data when available.
 *
 * @param currentHour - optional hour (0-23). If omitted, use local system hour.
 * @param observations - optional array of PriceObservation to derive observed savings.
 * @returns GoldenHourResult enriched with:
 *   - currentHour
 *   - isGoldenHour, isEveningWindow, isMorningPeak
 *   - savings (TimeWindowSavings)
 *   - confidence ('low'|'medium'|'high')
 *   - nextGoldenHour (hours until next 21:00; 0 if in golden hour)
 */
export function analyzeGoldenHour(
  currentHour?: number,
  observations?: PriceObservation[],
): GoldenHourResult & {
  currentHour: number;
  isGoldenHour: boolean;
  isEveningWindow: boolean;
  isMorningPeak: boolean;
  savings: TimeWindowSavings;
  confidence: "low" | "medium" | "high";
  nextGoldenHour: number;
} {
  const hour =
    typeof currentHour === "number" && Number.isFinite(currentHour)
      ? Math.floor(currentHour) % 24
      : new Date().getHours();

  // Build static TimeWindow descriptors (ADAC)
  const windows: TimeWindow[] = [
    {
      key: "goldenHour",
      label: "Golden Hour",
      startHour: TIME_WINDOWS.goldenHour.start,
      endHour: TIME_WINDOWS.goldenHour.end,
      expectedSavingCents: { min: 12, max: 17 },
    },
    {
      key: "eveningWindow",
      label: "Evening Window",
      startHour: TIME_WINDOWS.eveningWindow.start,
      endHour: TIME_WINDOWS.eveningWindow.end,
      expectedSavingCents: { min: 2, max: 4 },
    },
    {
      key: "morningPeak",
      label: "Morning Peak",
      startHour: TIME_WINDOWS.morningPeak.start,
      endHour: TIME_WINDOWS.morningPeak.end,
      expectedSavingCents: { min: -8, max: -8 },
    },
  ];

  // Evaluate the current named window
  const currentWindowName = getCurrentTimeWindow(hour);
  const currentWindow: TimeWindow | null =
    currentWindowName === "normal"
      ? null
      : (windows.find((w) => w.key === currentWindowName) ?? null);

  const isGoldenHour = currentWindowName === "goldenHour";
  const isEveningWindow = currentWindowName === "eveningWindow" || isGoldenHour;
  const isMorningPeak = currentWindowName === "morningPeak";

  // Decide savings: observed when possible, otherwise ADAC defaults
  let savings: TimeWindowSavings;
  if (observations && observations.length > 0) {
    savings = calculateObservedSavings(observations, currentWindowName);
  } else {
    savings = getDefaultSavings(currentWindowName);
  }

  // Confidence based on source and observation count
  const confidence = getConfidence(savings.source, savings.observationCount);

  // nextGoldenHour calculation per spec
  let nextGoldenHour: number;
  if (hour < 21) {
    nextGoldenHour = 21 - hour;
  } else if (hour >= 21 && hour < 22) {
    nextGoldenHour = 0;
  } else {
    nextGoldenHour = 24 - hour + 21;
  }

  // Assemble result
  const result: GoldenHourResult & {
    currentHour: number;
    isGoldenHour: boolean;
    isEveningWindow: boolean;
    isMorningPeak: boolean;
    savings: TimeWindowSavings;
    confidence: "low" | "medium" | "high";
    nextGoldenHour: number;
  } = {
    windows,
    currentWindow,
    nextWindow: null,
    isGoldenNow: isGoldenHour,
    savings,
    confidence,
    currentHour: hour,
    isGoldenHour,
    isEveningWindow,
    isMorningPeak,
    nextGoldenHour,
  };

  return result;
}
