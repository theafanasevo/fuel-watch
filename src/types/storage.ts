/**
 * src/types/storage.ts
 *
 * Versioned LocalStorage types and constants for schema migrations.
 */

/**
 * Numeric schema version for storage.
 *
 * Increment this constant whenever the storage shape changes and
 * implement migration logic elsewhere in the codebase that uses this value.
 */
export const VERSION = 1;

/**
 * LocalStorage key names used by the application.
 *
 * Keeping keys centralized reduces typos and makes migrations simpler.
 */
export const STORAGE_KEYS = {
  FAVORITES: "fuel-watch:favorites:v1",
  RECENT_SEARCHES: "fuel-watch:recent-searches:v1",
} as const;

/**
 * FavoriteStation
 *
 * Representation of a user's favorited station persisted to LocalStorage.
 */
export interface FavoriteStation {
  /**
   * Unique station identifier as provided by the data source (Tankerkönig ID).
   */
  id: string;

  /**
   * ISO 8601 timestamp (string) representing when the station was added to favorites.
   *
   * Use an ISO string to ease cross-platform serialization and display.
   */
  addedAt: string;

  /**
   * Optional human-friendly label or station name captured at the time of favoriting.
   *
   * Useful for offline display if the station metadata cannot be fetched.
   */
  label?: string;

  /**
   * Optional fuel types tracked for notifications or quick-filtering (e.g. "E5", "E10", "Diesel").
   *
   * Stored as string array to keep the storage schema decoupled from domain enums.
   */
  fuelTypes?: string[];
}

/**
 * RecentSearch
 *
 * Single entry describing a user's recent search saved to LocalStorage.
 */
export interface RecentSearch {
  /**
   * Raw search query as typed by the user (city name, postal code, or address).
   */
  query: string;

  /**
   * Epoch milliseconds when the search occurred (Date.now()).
   *
   * Using a number simplifies TTL and ordering operations.
   */
  timestamp: number;

  /**
   * Optional geocoded coordinates that correspond to the query at the time of search.
   *
   * Contains latitude and longitude when available; omitted otherwise.
   */
  coords?: {
    /**
     * Latitude in decimal degrees (WGS84).
     */
    lat: number;
    /**
     * Longitude in decimal degrees (WGS84).
     */
    lon: number;
  };
}

/**
 * StorageSchema
 *
 * Complete, versioned storage payload used when persisting the app's root storage object.
 * This shape can be stored under a single key for atomic migration, or individual keys
 * (STORAGE_KEYS) can be used — migration logic should reference `VERSION`.
 */
export interface StorageSchema {
  /**
   * Numeric schema version for the stored payload.
   *
   * Compare this to the exported `VERSION` constant to decide if migration is required.
   */
  version: number;

  /**
   * Array of favorited stations (may be empty).
   */
  favorites: FavoriteStation[];

  /**
   * FIFO list of recent searches ordered from newest to oldest.
   *
   * Consumers should enforce the maximum length (e.g. 5) when writing.
   */
  recentSearches: RecentSearch[];
}
