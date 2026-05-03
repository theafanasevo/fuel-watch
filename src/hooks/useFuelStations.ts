/**
 * useFuelStations
 *
 * Custom React hook to fetch nearby fuel stations via Tankerkoenig API.
 * Enforces a minimum polling interval and exposes fetch/refresh functions.
 */

import { useState, useRef, useCallback } from "react";
import type { TankerStation, FuelType } from "../types/fuel";
import { fetchNearbyStations } from "../api/tankerkoenig";
import { MIN_POLLING_INTERVAL_MS } from "../utils/constants";

/**
 * State and functions returned by useFuelStations.
 */
export interface UseFuelStationsResult {
  stations: TankerStation[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchStations: (
    lat: number,
    lng: number,
    radius: number,
    fuelType: FuelType,
  ) => void;
  refreshPrices: () => void;
}

/**
 * useFuelStations
 *
 * Fetches nearby fuel stations and manages polling interval.
 * Does not fetch on mount; only on explicit user action.
 * @returns State and functions for station search and refresh.
 */
export function useFuelStations(): UseFuelStationsResult {
  const [stations, setStations] = useState<TankerStation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  // Store last search params for refresh
  const lastParams = useRef<{
    lat: number;
    lng: number;
    radius: number;
    fuelType: FuelType;
  } | null>(null);

  // Store last fetch timestamp for polling enforcement
  const lastFetchTime = useRef<number | null>(null);

  /**
   * Fetch stations with provided parameters.
   * Enforces minimum polling interval.
   */
  const fetchStations = useCallback(
    (lat: number, lng: number, radius: number, fuelType: FuelType) => {
      const now = Date.now();
      if (
        lastFetchTime.current &&
        now - lastFetchTime.current < MIN_POLLING_INTERVAL_MS
      ) {
        // Too soon, do nothing
        return;
      }
      setLoading(true);
      setError(null);
      lastParams.current = { lat, lng, radius, fuelType };
      fetchNearbyStations(lat, lng, radius, fuelType)
        .then((result: TankerStation[]) => {
          setStations(result);
          setLastFetched(now);
          lastFetchTime.current = now;
          setLoading(false);
        })
        .catch(() => {
          setError("apiError");
          setLoading(false);
        });
    },
    [],
  );

  /**
   * Refresh prices using the last search parameters.
   */
  const refreshPrices = useCallback(() => {
    if (!lastParams.current) return;
    const { lat, lng, radius, fuelType } = lastParams.current;
    fetchStations(lat, lng, radius, fuelType);
  }, [fetchStations]);

  return {
    stations,
    loading,
    error,
    lastFetched,
    fetchStations,
    refreshPrices,
  };
}
