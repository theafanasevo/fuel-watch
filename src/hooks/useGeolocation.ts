/**
 * useGeolocation
 *
 * Custom React hook for requesting the user's geolocation.
 * Does NOT request location on mount (privacy).
 * Exposes a requestLocation() function to trigger the browser prompt.
 *
 * State:
 * - coords: { lat: number, lng: number } | null
 * - loading: boolean
 * - error: string | null (locale key from errors.*)
 *
 * @returns {object} Hook state and actions.
 */

import { useState, useCallback } from "react";

interface GeolocationCoords {
  lat: number;
  lng: number;
}

interface UseGeolocationResult {
  coords: GeolocationCoords | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

/**
 * useGeolocation hook for requesting browser geolocation with privacy and error handling.
 * @returns {UseGeolocationResult} Hook state and requestLocation trigger.
 */
export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("locationUnavailable");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("locationDenied");
        } else {
          setError("unknown");
        }
        setLoading(false);
      },
    );
  }, []);

  return {
    coords,
    loading,
    error,
    requestLocation,
  };
}
