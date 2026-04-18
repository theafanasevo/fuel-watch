/**
 * useFavorites hook
 *
 * Manages favorite stations using LocalStorage with optimistic UI updates.
 * Provides functions to add, remove, toggle, and check favorite stations.
 */

import { useCallback, useEffect, useRef, useState } from "react"; // React hooks for state and lifecycle
import { getFavorites, saveFavorite, removeFavorite } from "../utils/storage"; // LocalStorage utility functions for favorites
import type { FavoriteStation } from "../types/storage"; // Type for a favorite station

/**
 * Return type for useFavorites hook.
 */
export interface UseFavoritesResult {
  /** Current list of favorite stations */
  favorites: FavoriteStation[];
  /** Add a station to favorites */
  addFavorite: (station: FavoriteStation) => void;
  /** Remove a station from favorites by ID */
  removeFavoriteById: (stationId: string) => void;
  /** Toggle favorite status for a station */
  toggleFavorite: (station: FavoriteStation) => void;
  /** Check if a station is currently a favorite */
  checkIsFavorite: (stationId: string) => boolean;
}

/**
 * useFavorites
 *
 * React hook to manage favorite stations with LocalStorage persistence.
 * Handles optimistic updates and reverts state if storage write fails.
 *
 * @returns {UseFavoritesResult} API for managing favorites
 */
export function useFavorites(): UseFavoritesResult {
  // State for the list of favorite stations
  const [favorites, setFavorites] = useState<FavoriteStation[]>(() =>
    getFavorites(),
  );
  // Ref to store the previous state for rollback on error
  const prevFavoritesRef = useRef<FavoriteStation[]>(favorites);

  // Load favorites from LocalStorage on mount (no setState in effect body)
  useEffect(() => {
    const stored = getFavorites();
    prevFavoritesRef.current = stored;
    // Only update state if different to avoid unnecessary renders
    setFavorites((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(stored)) {
        return stored;
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Add a station to favorites and persist to LocalStorage.
   * Rolls back state if storage write fails.
   */
  const addFavorite = useCallback((station: FavoriteStation): void => {
    setFavorites((prev) => {
      // Prevent duplicates by station ID
      if (prev.some((fav) => fav.id === station.id)) return prev;
      const next = [...prev, station];
      try {
        saveFavorite(station);
        prevFavoritesRef.current = next;
        return next;
      } catch {
        // Rollback to previous state if storage fails
        return prev;
      }
    });
  }, []);

  /**
   * Remove a station from favorites by ID and persist to LocalStorage.
   * Rolls back state if storage write fails.
   */
  const removeFavoriteById = useCallback((stationId: string): void => {
    setFavorites((prev) => {
      const next = prev.filter((fav) => fav.id !== stationId);
      try {
        removeFavorite(stationId);
        prevFavoritesRef.current = next;
        return next;
      } catch {
        // Rollback to previous state if storage fails
        return prev;
      }
    });
  }, []);

  /**
   * Toggle favorite status for a station.
   * Adds if not present, removes if already a favorite.
   */
  const toggleFavorite = useCallback((station: FavoriteStation): void => {
    setFavorites((prev) => {
      const isFav = prev.some((fav) => fav.id === station.id);
      let next: FavoriteStation[];
      try {
        if (isFav) {
          removeFavorite(station.id);
          next = prev.filter((fav) => fav.id !== station.id);
        } else {
          saveFavorite(station);
          next = [...prev, station];
        }
        prevFavoritesRef.current = next;
        return next;
      } catch {
        // Rollback to previous state if storage fails
        return prev;
      }
    });
  }, []);

  /**
   * Check if a station is currently a favorite.
   * Uses current state for fast lookup.
   */
  const checkIsFavorite = useCallback(
    (stationId: string): boolean => {
      return favorites.some((fav) => fav.id === stationId);
    },
    [favorites],
  );

  // Expose the favorites state and management functions
  return {
    favorites,
    addFavorite,
    removeFavoriteById,
    toggleFavorite,
    checkIsFavorite,
  };
}
