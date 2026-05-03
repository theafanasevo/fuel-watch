/**
 * src/types/fuel.ts
 *
 * Type definitions for the Tankerkönig API responses.
 *
 * Reference: https://creativecommons.tankerkoenig.de/swagger/
 */

/**
 * Allowed fuel type keys as returned by the Tankerkönig API.
 */
export type FuelType = "e5" | "e10" | "diesel";

/**
 * Minimal mapping of fuel type keys to a price in EUR per liter.
 * Price values are numbers when available or null when not provided.
 */
export type TankerPriceMap = Record<FuelType, number | null>;

/**
 * A single station entry as returned by the Tankerkönig `list.php` endpoint.
 * Optional properties are marked as such because the API may omit some fields
 * depending on the endpoint or query parameters.
 */
export interface TankerStation {
  /**
   * Unique station identifier assigned by Tankerkönig.
   */
  id: string;

  /**
   * Human-friendly station name (may be undefined when not provided).
   */
  name?: string | null;

  /**
   * Brand name of the station (e.g. 'Shell', 'Aral').
   */
  brand?: string | null;

  /**
   * Street name of the station.
   */
  street?: string | null;

  /**
   * House number of the station address.
   */
  houseNumber?: string | null;

  /**
   * Postal code (PLZ) of the station's location.
   */
  postCode?: string | null;

  /**
   * City / place name of the station.
   */
  place?: string | null;

  /**
   * Latitude in decimal degrees.
   */
  lat: number;

  /**
   * Longitude in decimal degrees.
   */
  lng: number;

  /**
   * Distance in meters from the query center (when returned by `list.php`).
   */
  dist?: number | null;

  /**
   * Boolean flags indicating whether a price for the given fuel type is available.
   * Some endpoints return boolean availability (e.g. `diesel: true`) instead of a price.
   */
  diesel?: boolean | null;
  /**
   * E5 availability flag.
   */
  e5?: boolean | null;
  /**
   * E10 availability flag.
   */
  e10?: boolean | null;

  /**
   * Optional pre-populated price map for the station if the response included prices.
   * Keys are the fuel types and values are prices in EUR per liter or null if not available.
   */
  prices?: Partial<TankerPriceMap> | null;

  /**
   * Optional flag indicating whether the station is currently open.
   * The API sometimes returns an `isOpen`/`status` field per station.
   */
  isOpen?: boolean | null;

  /**
   * Optional textual status returned by the API (e.g. 'open', 'closed', 'unknown').
   */
  status?: string | null;
}

/**
 * Shape of the response from the Tankerkönig `list.php` endpoint.
 * The endpoint returns nearby stations matching the query.
 */
export interface TankerListResponse {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Array of stations found by the query.
   */
  stations: TankerStation[];

  /**
   * Optional informational message returned by the API on failure or partial success.
   */
  message?: string | null;
}

/**
 * Single price record as returned by the Tankerkönig `prices.php` endpoint.
 * The `prices.php` endpoint typically returns an array of objects where each
 * object contains price fields for one station.
 */
export interface TankerPriceRecord {
  /**
   * Tankerkönig station ID this price record belongs to.
   */
  stationId: string;

  /**
   * Timestamp (UNIX epoch seconds) when the price was last updated, if provided.
   */
  priceTimestamp?: number | null;

  /**
   * Optional numeric price for diesel in EUR per liter, or null if not provided.
   */
  diesel?: number | null;

  /**
   * Optional numeric price for E5 in EUR per liter, or null if not provided.
   */
  e5?: number | null;

  /**
   * Optional numeric price for E10 in EUR per liter, or null if not provided.
   */
  e10?: number | null;

  /**
   * Convenience map of prices keyed by fuel type.
   * May be derived from the diesel/e5/e10 fields when present.
   */
  prices?: Partial<TankerPriceMap> | null;

  /**
   * Optional flag indicating whether the station is open at the time of the price.
   */
  isOpen?: boolean | null;

  /**
   * Optional textual status (e.g. 'open', 'closed').
   */
  status?: string | null;
}

/**
 * Shape of the response from the Tankerkönig `prices.php` endpoint.
 */
export interface TankerPricesResponse {
  /**
   * Indicates whether the API call was successful.
   */
  ok: boolean;

  /**
   * Array of price records for requested stations.
   */
  prices: TankerPriceRecord[];

  /**
   * Optional informational or error message from the API.
   */
  message?: string | null;
}

/**
 * Generic error object returned in some Tankerkönig responses.
 */
export interface TankerError {
  /**
   * Human readable message describing the error.
   */
  message: string;

  /**tasarım kısmından çok hoşnut kalmadım
   * Optional numeric code describing the error condition.
   */
  code?: number;
}
