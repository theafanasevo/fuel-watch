/**
 * Type-safe LocalStorage helpers with schema versioning and migration support.
 * Handles favorites and recent searches for Fuel-Watch.
 */

import type { FavoriteStation, RecentSearch } from "../types/storage";
import {
  STORAGE_KEYS,
  STORAGE_VERSION,
  MAX_RECENT_SEARCHES,
} from "./constants";

/**
 * Reads and parses a value from localStorage, validating schema version.
 * @param key - The localStorage key to read.
 * @returns Parsed data of type T or null if not found/invalid.
 */
export function readFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { version: number; data: T };
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Serializes and writes a value to localStorage with schema version.
 * @param key - The localStorage key to write.
 * @param data - The data to store.
 * @returns True on success, false on failure.
 */
export function writeToStorage<T>(key: string, data: T): boolean {
  try {
    const payload = JSON.stringify({ version: STORAGE_VERSION, data });
    localStorage.setItem(key, payload);
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes a key from localStorage.
 * @param key - The localStorage key to remove.
 * @returns True on success, false on failure.
 */
export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads the favorites array from storage.
 * @returns Array of FavoriteStation, or empty array if not found.
 */
export function getFavorites(): FavoriteStation[] {
  const data = readFromStorage<FavoriteStation[]>(STORAGE_KEYS.FAVORITES);
  return Array.isArray(data) ? data : [];
}

/**
 * Adds a station to favorites, preventing duplicates.
 * @param station - The FavoriteStation to add.
 * @returns True on success, false on failure.
 */
export function saveFavorite(station: FavoriteStation): boolean {
  const favorites = getFavorites();
  if (favorites.some((fav) => fav.id === station.id)) return true;
  const updated = [...favorites, station];
  return writeToStorage<FavoriteStation[]>(STORAGE_KEYS.FAVORITES, updated);
}

/**
 * Removes a station from favorites by ID.
 * @param stationId - The station ID to remove.
 * @returns True on success, false on failure.
 */
export function removeFavorite(stationId: string): boolean {
  const favorites = getFavorites();
  const updated = favorites.filter((fav) => fav.id !== stationId);
  return writeToStorage<FavoriteStation[]>(STORAGE_KEYS.FAVORITES, updated);
}

/**
 * Checks if a station ID exists in favorites.
 * @param stationId - The station ID to check.
 * @returns True if the station is a favorite, false otherwise.
 */
export function isFavorite(stationId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === stationId);
}

/**
 * Reads the recent searches array from storage.
 * @returns Array of RecentSearch, or empty array if not found.
 */
export function getRecentSearches(): RecentSearch[] {
  const data = readFromStorage<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES);
  return Array.isArray(data) ? data : [];
}

/**
 * Adds a new search to recent searches, enforcing max size and uniqueness.
 * @param search - The RecentSearch to add.
 * @returns True on success, false on failure.
 */
export function addRecentSearch(search: RecentSearch): boolean {
  let recents = getRecentSearches();
  recents = recents.filter((r) => r.query !== search.query);
  recents.unshift(search);
  if (recents.length > MAX_RECENT_SEARCHES) {
    recents = recents.slice(0, MAX_RECENT_SEARCHES);
  }
  return writeToStorage<RecentSearch[]>(STORAGE_KEYS.RECENT_SEARCHES, recents);
}

/**
 * Removes all recent searches from storage.
 * @returns True on success, false on failure.
 */
export function clearRecentSearches(): boolean {
  return removeFromStorage(STORAGE_KEYS.RECENT_SEARCHES);
}

/**
 * Checks if the stored version for a key matches STORAGE_VERSION.
 * @param key - The localStorage key to check.
 * @returns True if version matches, false otherwise.
 */
export function checkStorageVersion(key: string): boolean {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { version: number };
    return parsed.version === STORAGE_VERSION;
  } catch {
    return false;
  }
}
