/**
 * src/utils/constants.ts
 *
 * Application-wide constants and defaults.
 *
 * Environment variables are read from `import.meta.env` (Vite).
 */

import type { Coordinates } from "../types/geo"; // Coordinates shape used throughout the app
import type { TankerFuelType } from "../types/fuel"; // Tankerkönig fuel type keys

/**
 * Safe access to Vite environment variables.
 * Cast to a string|undefined record to avoid TS errors when reading unknown keys.
 */
const ENV = import.meta.env as unknown as Record<string, string | undefined>;

/**
 * Base URL for the Tankerkönig API used for `list.php` and `prices.php`.
 * Example: https://creativecommons.tankerkoenig.de/json
 */
export const TANKERKOENIG_API_URL: string =
  ENV.VITE_TANKER_URL ?? "https://creativecommons.tankerkoenig.de/json";

/**
 * Base URL for the Photon geocoding API (photon.komoot.io).
 * Example: https://photon.komoot.io/api
 */
export const PHOTON_API_URL: string =
  ENV.VITE_PHOTON_URL ?? "https://photon.komoot.io/api";

/**
 * Default coordinates used when no user location is available.
 * - Reads `VITE_DEFAULT_COORDS` as `lat,lon` if present
 * - Falls back to Berlin (52.52, 13.405)
 */
export const DEFAULT_COORDS: Coordinates = (() => {
  const raw = ENV.VITE_DEFAULT_COORDS;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      const lat = Number(parts[0]);
      const lon = Number(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        return { lat, lon };
      }
    }
  }

  // Berlin fallback
  return { lat: 52.52, lon: 13.405 };
})();

/**
 * Default search radius in kilometers.
 * Read from VITE_DEFAULT_RADIUS (number in km) or fallback to 10 km.
 */
export const DEFAULT_RADIUS: number = (() => {
  const raw = ENV.VITE_DEFAULT_RADIUS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
})();

/**
 * Default radius expressed in meters for APIs that expect meters.
 */
export const DEFAULT_RADIUS_METERS = Math.round(DEFAULT_RADIUS * 1000);

/**
 * Default fuel type used when none is selected.
 * Read from VITE_DEFAULT_FUEL_TYPE or fallback to 'e5'.
 */
export const DEFAULT_FUEL_TYPE: TankerFuelType =
  ((ENV.VITE_DEFAULT_FUEL_TYPE as TankerFuelType | undefined) ??
    "e5") as TankerFuelType;

/**
 * Fuel types supported by the UI. Each entry maps a fuel key to a locale label key
 * that can be resolved via the translation files (e.g. 'fuel.e5').
 */
export const FUEL_TYPES: Array<{ key: TankerFuelType; labelKey: string }> = [
  { key: "e5", labelKey: "fuel.e5" },
  { key: "e10", labelKey: "fuel.e10" },
  { key: "diesel", labelKey: "fuel.diesel" },
];

/**
 * Radius picker options (in kilometers) presented to the user.
 */
export const RADIUS_OPTIONS: number[] = [5, 10, 15, 25, 50];

/**
 * Minimum polling interval enforced for the Tankerkönig API, in milliseconds.
 * Tankerkönig requires at least 5 minutes between requests.
 */
export const MIN_POLLING_INTERVAL_MS: number = 5 * 60 * 1000; // 300000 ms

/**
 * Maximum number of results to request from Photon for search-as-you-type.
 */
export const PHOTON_MAX_RESULTS = 5;

/**
 * Scoring thresholds used to map price differences to human categories.
 * Difference is computed as (currentPrice - dailyAreaAverage) in EUR.
 */
export const SCORE_THRESHOLDS = {
  greatDeal: -0.05, // difference < -0.05 EUR => Great Deal
  fair: 0.0, // difference between -0.05 and 0.00 => Fair Price
} as const;

/**
 * Predefined time windows (hours in local 24h) used for golden hour analysis.
 * Hours are inclusive of `start` and exclusive of `end`.
 */
export const TIME_WINDOWS = {
  goldenHour: { start: 21, end: 22 }, // absolute cheapest window
  eveningWindow: { start: 16, end: 22 }, // below average window
  morningPeak: { start: 5, end: 7 }, // most expensive window
} as const;

/**
 * Observation thresholds for deriving observed savings from user data.
 *
 * Two forms are exported:
 * - OBSERVATION_THRESHOLDS grouped object for contextual imports
 * - MIN_OBSERVATIONS and HIGH_CONFIDENCE_THRESHOLD named constants for direct use
 *
 * Defaults:
 * - MIN_OBSERVATIONS: 7 (minimum data points to use observed data)
 * - HIGH_CONFIDENCE_THRESHOLD: 20 (data points for 'high' confidence)
 */
export const MIN_OBSERVATIONS = 7; // minimum observations to consider observed data
export const HIGH_CONFIDENCE_THRESHOLD = 20; // observations required for 'high' confidence

export const OBSERVATION_THRESHOLDS = {
  MIN_OBSERVATIONS_MEDIUM: MIN_OBSERVATIONS,
  MIN_OBSERVATIONS_HIGH: HIGH_CONFIDENCE_THRESHOLD,
} as const;

/**
 * LocalStorage key names used by the application.
 * Keep keys versioned so migrations and clearing are straightforward.
 */
export const STORAGE_KEYS = {
  FAVORITES: ENV.VITE_STORAGE_FAVORITES_KEY ?? "fuel-watch:favorites:v1",
  RECENT_SEARCHES:
    ENV.VITE_STORAGE_RECENT_SEARCHES_KEY ?? "fuel-watch:recent-searches:v1",
  ROOT_SCHEMA: ENV.VITE_STORAGE_ROOT_KEY ?? "fuel-watch:storage:v1",
} as const;

/**
 * Storage schema version identifier. Update when persisted schema changes.
 */
export const STORAGE_VERSION = ENV.VITE_STORAGE_VERSION ?? "v1";

/**
 * Maximum number of recent searches to keep in LocalStorage.
 */
export const MAX_RECENT_SEARCHES = (() => {
  const raw = ENV.VITE_MAX_RECENT_SEARCHES;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0
    ? Math.max(1, Math.floor(parsed))
    : 5;
})();

/**
 * Notification content limits enforced by the application.
 */
export const NOTIFICATION_LIMITS = {
  maxHeadlineLength: Number(ENV.VITE_NOTIFICATION_HEADLINE_MAX ?? 50),
  maxBodyLength: Number(ENV.VITE_NOTIFICATION_BODY_MAX ?? 200),
} as const;

/**
 * Defaults object for convenience in tests and runtime checks.
 */
export const defaults = {
  tankerUrl: TANKERKOENIG_API_URL,
  photonUrl: PHOTON_API_URL,
  coords: DEFAULT_COORDS,
  radiusKm: DEFAULT_RADIUS,
  radiusMeters: DEFAULT_RADIUS_METERS,
  defaultFuel: DEFAULT_FUEL_TYPE,
  minPollingMs: MIN_POLLING_INTERVAL_MS,
  photonMaxResults: PHOTON_MAX_RESULTS,
  storageVersion: STORAGE_VERSION,
  minObservations: MIN_OBSERVATIONS,
  highConfidenceThreshold: HIGH_CONFIDENCE_THRESHOLD,
};
