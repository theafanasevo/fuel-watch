/**
 * src/api/tankerkoenig.ts
 *
 * Pure HTTP client for the Tankerkönig API (list.php and prices.php).
 * - Exports typed functions that return Tankerkönig types.
 * - Enforces minimum polling interval to respect API constraints.
 *
 * Notes:
 * - Environment variable: VITE_TANKERKOENIG_API_KEY is required for authenticated calls.
 * - This module throws Error instances where the message is one of the
 *   locale keys: "apiKeyMissing", "apiError", "apiThrottled", "networkError".
 */

import type {
  TankerStation,
  TankerListResponse,
  TankerPricesResponse,
  TankerPriceRecord,
  TankerFuelType,
} from "../types/fuel"; // import Tankerkönig types

import {
  TANKERKOENIG_API_URL,
  MIN_POLLING_INTERVAL_MS,
} from "../utils/constants"; // import constants

/* -------------------------------------------------------------------------- */
/* Module-scoped request timestamp tracking to enforce minimum polling rules.  */
/* -------------------------------------------------------------------------- */

/**
 * Timestamp (ms since epoch) of the last call to list.php.
 * Used to prevent polling more frequently than MIN_POLLING_INTERVAL_MS.
 */
let lastListRequestAt: number | null = null;

/**
 * Timestamp (ms since epoch) of the last call to prices.php.
 * Used to prevent polling more frequently than MIN_POLLING_INTERVAL_MS.
 */
let lastPricesRequestAt: number | null = null;

/* -------------------------------------------------------------------------- */
/* Helper utilities                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Read the Tankerkönig API key from the environment.
 * @returns {string | null} - API key string or null when missing.
 */
function getApiKey(): string | null {
  // Vite exposes env vars on import.meta.env; provide a narrow type to avoid `any`.
  const key = (
    import.meta as unknown as { env?: { VITE_TANKERKOENIG_API_KEY?: string } }
  ).env?.VITE_TANKERKOENIG_API_KEY;
  return typeof key === "string" && key.length > 0 ? key : null;
}

/**
 * Throw a localized error by key (matches locales keys).
 * @param {string} key - One of: apiKeyMissing, apiError, apiThrottled, networkError
 * @throws {Error}
 */
function throwLocaleError(
  key: "apiKeyMissing" | "apiError" | "apiThrottled" | "networkError",
): never {
  throw new Error(key);
}

/**
 * Enforce minimum polling interval for a given last-request timestamp.
 * If called too soon, throws 'apiThrottled'.
 *
 * @param lastAt - last request timestamp in ms or null
 * @param now - current timestamp in ms
 */
function enforceMinPolling(lastAt: number | null, now: number): void {
  if (lastAt === null) return;
  if (now - lastAt < MIN_POLLING_INTERVAL_MS) {
    throwLocaleError("apiThrottled");
  }
}

/* -------------------------------------------------------------------------- */
/* Public API functions                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Fetch nearby stations using Tankerkönig `list.php`.
 *
 * This function performs a GET request to:
 *   `${TANKERKOENIG_API_URL}/list.php?lat={lat}&lng={lng}&rad={radiusMeters}&type=all&apikey={key}`
 *
 * - Enforces a minimum polling interval; calling this function more often than
 *   MIN_POLLING_INTERVAL_MS will throw "apiThrottled".
 * - Throws "apiKeyMissing" when the API key is not set.
 * - Throws "networkError" on fetch/network failures.
 * - Throws "apiError" when the API responds with ok=false or unexpected shape.
 *
 * @param lat - latitude in decimal degrees
 * @param lng - longitude in decimal degrees
 * @param radiusMeters - search radius in meters
 * @param fuelType - (optional) fuel type filter (e5, e10, diesel) - currently passed as a hint only
 * @returns Promise<TankerStation[]> - array of station summaries
 */
export async function fetchNearbyStations(
  lat: number,
  lng: number,
  radiusMeters: number,
  fuelType?: TankerFuelType,
): Promise<TankerStation[]> {
  // Validate API key presence
  const apiKey = getApiKey();
  if (!apiKey) {
    throwLocaleError("apiKeyMissing");
  }

  // Enforce min polling interval for list.php
  const now = Date.now();
  enforceMinPolling(lastListRequestAt, now);

  // Build URL with query params (type=all returns stations with distance)
  const url = new URL(TANKERKOENIG_API_URL);
  // Ensure endpoint path ends with /list.php (the constant may include /json)
  // If TANKERKOENIG_API_URL already includes path, append correctly.
  if (!url.pathname.endsWith("/list.php")) {
    // Append list.php to the base path if not present
    url.pathname = url.pathname.replace(/\/$/, "") + "/list.php";
  }

  // Append required query parameters
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("rad", String(Math.round(radiusMeters)));
  // include all types; server will return available info
  url.searchParams.set("type", "all");
  // pass API key
  url.searchParams.set("apikey", apiKey);
  // Optionally pass fuel hint - Tankerkönig ignores unknown params but keep for clarity
  if (fuelType) {
    url.searchParams.set("fuel", fuelType);
  }

  // Perform the HTTP request
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    // Network level failure
    throwLocaleError("networkError");
  }

  // Handle HTTP-level throttling (429) explicitly
  if (response.status === 429) {
    throwLocaleError("apiThrottled");
  }

  // Attempt to parse JSON response
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    // Malformed JSON or empty body
    throwLocaleError("apiError");
  }

  // Basic shape validation and error handling
  const body = payload as Partial<TankerListResponse>;
  if (
    !body ||
    typeof body !== "object" ||
    body.ok !== true ||
    !Array.isArray((body as unknown as { stations?: unknown }).stations)
  ) {
    // If the API explicitly returned ok:false with a message, treat as apiError
    throwLocaleError("apiError");
  }

  // Update request timestamp (successful parse indicates a valid response)
  lastListRequestAt = now;

  // Return typed station list
  return (body as TankerListResponse).stations;
}

/**
 * Fetch prices for known station IDs using Tankerkönig `prices.php`.
 *
 * This function performs a GET request to:
 *   `${TANKERKOENIG_API_URL}/prices.php?ids={commaSeparatedIds}&apikey={key}`
 *
 * - Enforces a minimum polling interval; calling this function more often than
 *   MIN_POLLING_INTERVAL_MS will throw "apiThrottled".
 * - Throws "apiKeyMissing" when the API key is not set.
 * - Throws "networkError" on fetch/network failures.
 * - Throws "apiError" when the API responds with ok=false or unexpected shape.
 *
 * @param stationIds - array of Tankerkönig station IDs to fetch prices for
 * @returns Promise<TankerPriceRecord[]> - array of price records
 */
export async function fetchPrices(
  stationIds: string[],
): Promise<TankerPriceRecord[]> {
  // Validate inputs
  if (!Array.isArray(stationIds) || stationIds.length === 0) {
    // Return empty array for no input (caller should validate), do not treat as error
    return [];
  }

  // Validate API Key
  const apiKey = getApiKey();
  if (!apiKey) {
    throwLocaleError("apiKeyMissing");
  }

  // Enforce min polling interval for prices.php
  const now = Date.now();
  enforceMinPolling(lastPricesRequestAt, now);

  // Build URL to prices.php
  const url = new URL(TANKERKOENIG_API_URL);
  if (!url.pathname.endsWith("/prices.php")) {
    url.pathname = url.pathname.replace(/\/$/, "") + "/prices.php";
  }

  // Set query params: ids as comma-separated list and apikey
  url.searchParams.set("ids", stationIds.join(","));
  url.searchParams.set("apikey", apiKey);

  // Fetch
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throwLocaleError("networkError");
  }

  // Handle HTTP-level throttling
  if (response.status === 429) {
    throwLocaleError("apiThrottled");
  }

  // Parse JSON
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throwLocaleError("apiError");
  }

  // Validate payload shape
  const body = payload as Partial<TankerPricesResponse>;
  if (
    !body ||
    typeof body !== "object" ||
    body.ok !== true ||
    !Array.isArray((body as unknown as { prices?: unknown }).prices)
  ) {
    throwLocaleError("apiError");
  }

  // Update timestamp
  lastPricesRequestAt = now;

  // Return typed price records
  return (body as TankerPricesResponse).prices;
}

/* -------------------------------------------------------------------------- */
/* Module exports (named)                                                     */
/* -------------------------------------------------------------------------- */

export default {
  fetchNearbyStations,
  fetchPrices,
};
