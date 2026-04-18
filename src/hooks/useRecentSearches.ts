/**
 * useRecentSearches hook
 *
 * Manages recent search history using LocalStorage with FIFO eviction,
 * duplicate prevention, and a maximum history length.
 * Provides functions to add a search and clear history.
 */

import { useCallback, useEffect, useState } from "react"; // React hooks for state and lifecycle
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from "../utils/storage"; // Storage helpers
import type { RecentSearch } from "../types/storage"; // Type-only import for RecentSearch
import { MAX_RECENT_SEARCHES } from "../utils/constants"; // Max history length

/**
 * Return type for useRecentSearches hook.
 */
export interface UseRecentSearchesResult {
  /** Current recent searches array */
  readonly searches: RecentSearch[];
  /** Add a search to history */
  addSearch: (search: RecentSearch) => void;
  /** Clear all search history */
  clearHistory: () => void;
}

/**
 * useRecentSearches
 *
 * Provides recent search history state and actions.
 * Loads from LocalStorage on mount, persists changes, and
 * enforces max history length and duplicate prevention.
 *
 * @returns {UseRecentSearchesResult} Hook API for recent searches
 */
export function useRecentSearches(): UseRecentSearchesResult {
  // State for recent searches
  const [searches, setSearches] = useState<RecentSearch[]>(() => {
    // Load initial state from LocalStorage
    return getRecentSearches();
  });

  /**
   * Add a search to history.
   * - Prepends to state array.
   * - Removes duplicates by query string.
   * - Enforces MAX_RECENT_SEARCHES limit (FIFO).
   * - Persists to LocalStorage.
   * - Reverts state if storage write fails.
   */
  const addSearch = useCallback((search: RecentSearch): void => {
    setSearches((prev) => {
      // Remove duplicates by query string
      const filtered = prev.filter((s) => s.query !== search.query);
      // Add new search to beginning
      const next = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        // Persist to LocalStorage
        addRecentSearch(search);
        // Return new state
        return next;
      } catch {
        // Revert to previous state if storage fails
        return prev;
      }
    });
  }, []);

  /**
   * Clear all search history.
   * - Empties state and LocalStorage.
   * - Reverts state if storage clear fails.
   */
  const clearHistory = useCallback((): void => {
    setSearches((prev) => {
      try {
        // Clear LocalStorage
        clearRecentSearches();
        // Return empty array
        return [];
      } catch {
        // Revert to previous state if storage fails
        return prev;
      }
    });
  }, []);

  /**
   * On mount, sync state with LocalStorage in case of external changes.
   */
  useEffect(() => {
    // Handler for storage events
    function handleStorage(e: StorageEvent) {
      // Only react to relevant key
      if (e.key && e.key.includes("recent-searches")) {
        setSearches(getRecentSearches());
      }
    }
    // Listen for storage changes
    window.addEventListener("storage", handleStorage);
    // Cleanup on unmount
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Return hook API
  return { searches, addSearch, clearHistory };
}
