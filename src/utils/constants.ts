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
 * See: https://creativecommons.tankerkoenig.de/swagger/
 */
export const TANKERKOENIG_API_URL: string =
  ENV.VITE_TANKER_URL ?? "https://creativecommons.tankerkoenig.de/json";

/**
 * Base URL for the Photon geocoding API (photon.komoot.io).
 * See: https://photon.komoot.io
 */
export const PHOTON_API_URL: string =
  ENV.VITE_PHOTON_URL ?? "https://photon.komoot.io/api";

/**
 * Default coordinates used when no user location is available.
 * Can be configured via `VITE_DEFAULT_COORDS` environment variable as `lat,lon`.
 * Fallback is Berlin (52.5200, 13.4050).
 */
export const DEFAULT_COORDS: Coordinates = (() => {
  const raw = ENV.VITE_DEFAULT_COORDS;
  if (raw) {
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
 * Default search radius (in kilometers).
 * Can be configured via `VITE_DEFAULT_RADIUS` environment variable.
 * Fallback is 10 (kilometers).
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
 * Can be configured via `VITE_DEFAULT_FUEL_TYPE` environment variable.
 * Fallback is `"e5"`.
 */
export const DEFAULT_FUEL_TYPE: TankerFuelType =
  ((ENV.VITE_DEFAULT_FUEL_TYPE as TankerFuelType | undefined) ??
    "e5") as TankerFuelType;

/**
 * Fuel types exposed to the UI.
 * Each entry uses a key that matches the locales JSON keys under `fuel`.
 * Label keys should be resolved via the translation function (e.g. `t('fuel.e5')`).
 */
export const FUEL_TYPES: Array<{ key: TankerFuelType; labelKey: string }> = [
  { key: "e5", labelKey: "fuel.e5" },
  { key: "e10", labelKey: "fuel.e10" },
  { key: "diesel", labelKey: "fuel.diesel" },
];

/**
 * Radius options (in kilometers) presented to the user.
 */
export const RADIUS_OPTIONS: number[] = [5, 10, 15, 25, 50];

/**
 * Minimum polling interval enforced for the Tankerkönig API, in milliseconds.
 * 5 minutes = 300_000 ms
 */
export const MIN_POLLING_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Maximum number of results to request from Photon per query.
 */
export const PHOTON_MAX_RESULTS = 5;

/**
 * Thresholds used to classify pricing differences (currentPrice - areaAverage).
 * Values are expressed in Euros.
 *
 * - If difference < greatDeal -> great deal
 * - If difference between greatDeal and fair -> fair
 * - If difference > fair -> expensive
 */
export const SCORE_THRESHOLDS = {
  greatDeal: -0.05, // difference < -0.05 EUR => Great Deal
  fair: 0.0, // difference >= -0.05 and <= 0.00 => Fair Price
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
 * LocalStorage key names used in the application.
 * Keep keys versioned so migrations and clearing are straightforward.
 */
export const STORAGE_KEYS = {
  FAVORITES: ENV.VITE_STORAGE_FAVORITES_KEY ?? "fuel-watch:favorites:v1",
  RECENT_SEARCHES:
    ENV.VITE_STORAGE_RECENT_SEARCHES_KEY ?? "fuel-watch:recent-searches:v1",
  ROOT_SCHEMA: ENV.VITE_STORAGE_ROOT_KEY ?? "fuel-watch:storage:v1",
} as const;

/**
 * Storage schema version string. Update when the persisted schema changes.
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
 * Notification content limits to ensure concise messages.
 */
export const NOTIFICATION_LIMITS = {
  maxHeadlineLength: Number(ENV.VITE_NOTIFICATION_HEADLINE_MAX ?? 50),
  maxBodyLength: Number(ENV.VITE_NOTIFICATION_BODY_MAX ?? 200),
} as const;

/**
 * Expose a small helper with defaults useful for tests and runtime checks.
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
};
