/**
 * useGeocode
 *
 * Custom React hook for searching city/PLZ/address via the Photon API.
 * Debounces input, manages loading/error state, and returns up to 5 results.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { searchLocation as photonSearchLocation } from "../api/photon";
import type { PhotonResult } from "../types/geo";

/**
 * Return type for useGeocode hook.
 */
export interface UseGeocodeResult {
  results: PhotonResult[];
  loading: boolean;
  error: string | null;
  searchLocation: (query: string) => void;
}

/**
 * useGeocode
 *
 * Debounced search for city/PLZ/address using the Photon API.
 * @returns {UseGeocodeResult} Hook state and search function.
 */
export function useGeocode(): UseGeocodeResult {
  const [results, setResults] = useState<PhotonResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const activeQueryRef = useRef<string>("");

  /**
   * Triggers a debounced search for the given query.
   * @param query - The search string (city, PLZ, address).
   */
  const searchLocation = useCallback((query: string) => {
    if (debounceRef.current !== undefined) {
      window.clearTimeout(debounceRef.current);
    }
    if (!query || query.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      activeQueryRef.current = "";
      return;
    }
    setLoading(true);
    setError(null);
    activeQueryRef.current = query;
    debounceRef.current = window.setTimeout(async () => {
      try {
        const photonResults: PhotonResult[] = await photonSearchLocation(query);
        // Only update if the query is still current
        if (activeQueryRef.current === query) {
          /* Deduplicate by name — same city can appear as node, way, relation */
          const seen = new Set<string>();
          const unique = photonResults.filter((result) => {
            if (seen.has(result.name)) return false; // Skip duplicate name
            seen.add(result.name); // Mark name as seen
            return true;
          });
          setResults(unique.slice(0, 5)); // Max 5 unique results
          setError(null);
        }
      } catch {
        if (activeQueryRef.current === query) {
          setResults([]);
          setError("geocodeError");
        }
      } finally {
        if (activeQueryRef.current === query) {
          setLoading(false);
        }
      }
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current !== undefined) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    results,
    loading,
    error,
    searchLocation,
  };
}
