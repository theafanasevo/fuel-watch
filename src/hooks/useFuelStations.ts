import { useEffect, useRef, useState, useCallback } from 'react'; // React hooks for state and lifecycle management
import type { Station, FuelType } from '../types/fuel'; // Import strong types for station and fuel type
import { fetchStationsNearby } from '../api/tankerkoenig'; // API client to retrieve nearby stations (pure HTTP client)

/** // Minimum polling interval enforced by Tankerkönig API requirements */
const MIN_POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

/** // Options passed to the hook for querying stations */
export interface UseFuelStationsOptions { // Options shape for the hook
  fuelType: FuelType; // Fuel type to request (E5 | E10 | Diesel)
  radiusMeters?: number; // Search radius in meters (optional)
  pollingIntervalMs?: number; // Desired polling interval in milliseconds (optional)
  enabled?: boolean; // Whether polling/fetching is enabled (optional)
} // End of interface

/** // Result returned from the hook to consuming components */
export interface UseFuelStationsResult { // Hook return shape
  stations: Station[]; // Array of stations found
  loading: boolean; // Loading state flag
  error: Error | null; // Error object when request fails
  refresh: () => Promise<void>; // Manual refresh function
} // End of interface

/**
 * useFuelStations hook
 * Fetches nearby fuel stations using the Tankerkönig API and respects minimum polling.
 * All side-effects (HTTP) are delegated to api/tankerkoenig.ts to keep responsibilities separated.
 *
 * @param lat - Latitude of the center point for station search
 * @param lon - Longitude of the center point for station search
 * @param options - Hook options to control fuel type, radius and polling
 * @returns UseFuelStationsResult - stations, loading, error and refresh function
 */
export function useFuelStations( // Named export for the hook function
  lat: number | null, // Latitude may be null until geolocation resolves
  lon: number | null, // Longitude may be null until geolocation resolves
  options: UseFuelStationsOptions, // Options for the hook
): UseFuelStationsResult { // Return type annotation
  const { fuelType, radiusMeters = 5000, pollingIntervalMs, enabled = true } = options; // Destructure options with defaults
  const [stations, setStations] = useState<Station[]>([]); // State storing fetched stations
  const [loading, setLoading] = useState<boolean>(false); // State storing loading indicator
  const [error, setError] = useState<Error | null>(null); // State storing any request error
  const abortRef = useRef<AbortController | null>(null); // Ref to track the current abort controller
  const pollingRef = useRef<number | null>(null); // Ref to store polling timer id (as number)

  const effectivePollingMs = Math.max(MIN_POLL_INTERVAL_MS, pollingIntervalMs ?? MIN_POLL_INTERVAL_MS); // Enforce minimum polling interval

  /** // Internal fetch function that queries the API client and updates state */
  const doFetch = useCallback(async (): Promise<void> => { // useCallback for stable reference
    if (!enabled) { // If hook is disabled, skip fetching
      return; // Early return when disabled
    } // End if
    if (lat === null || lon === null) { // If coordinates are not available, skip fetching
      return; // Early return when location not ready
    } // End if

    try { // Begin try block for network operation
      setLoading(true); // Mark as loading before request
      setError(null); // Clear previous errors before request

      if (abortRef.current) { // If a previous controller exists, abort previous request
        abortRef.current.abort(); // Abort previous request to avoid race conditions
      } // End if

      const controller = new AbortController(); // Create a new AbortController for this request
      abortRef.current = controller; // Store controller in ref for cancellation

      // Delegate HTTP call to the API client which should return typed Station[].
      const result = await fetchStationsNearby({ // Call API client with search parameters
        lat, // Latitude for the search
        lon, // Longitude for the search
        radius: radiusMeters, // Radius in meters
        fuel: fuelType, // Fuel type filter
        signal: controller.signal, // Abort signal for cancellation support
      }); // End API call

      setStations(result); // Update stations state with API response
      setLoading(false); // Clear loading state after success
      setError(null); // Ensure error is null on successful fetch
    } catch (err) { // Catch network or parsing errors
      if ((err as Error).name === 'AbortError') { // If the error is an abort, ignore state changes
        // Aborted fetch; do not set error state for user-visible aborts.
      } else { // For other errors, set error state for UI to display
        setError(err as Error); // Store the error for the consumer
        setLoading(false); // Clear loading flag when error occurs
      } // End inner if
    } finally { // Finally block always executes after try/catch
      // Intentionally left blank; state was managed above as appropriate.
    } // End finally
  }, [lat, lon, radiusMeters, fuelType, enabled]); // Dependencies for stable callback

  /** // Manual refresh exposed to consumers to force immediate fetch */
  const refresh = useCallback(async (): Promise<void> => { // Named refresh function
    await doFetch(); // Execute internal fetch and await completion
  }, [doFetch]); // Dependency on doFetch

  useEffect(() => { // Effect to perform initial fetch and set up polling
    // Start a fetch immediately when coordinates and enabled flag permit.
    if (!enabled || lat === null || lon === null) { // If not ready, skip setup
      return; // Clean exit from effect
    } // End if

    // Immediately fetch once to populate UI.
    void doFetch(); // Trigger fetch and intentionally ignore returned promise

    // Set up polling interval using enforced minimum interval.
    pollingRef.current = window.setInterval(() => { // Start interval timer for periodic polling
      void doFetch(); // Trigger periodic fetch
    }, effectivePollingMs); // Interval duration in ms

    return () => { // Cleanup function when component unmounts or deps change
      // Clear polling timer if set.
      if (pollingRef.current !== null) { // If timer exists
        clearInterval(pollingRef.current); // Clear the interval timer
        pollingRef.current = null; // Reset ref to null
      } // End if

      // Abort any in-flight request to avoid memory leaks.
      if (abortRef.current) { // If an abort controller exists
        abortRef.current.abort(); // Abort the ongoing request
        abortRef.current = null; // Clear the ref after aborting
      } // End if
    }; // End cleanup
  }, [doFetch, effectivePollingMs, enabled, lat, lon]); // Effect dependencies

  useEffect(() => { // Effect to handle disabling the hook mid-lifecycle
    if (!enabled) { // If disabled, perform cleanup analogous to unmount
      if (pollingRef.current !== null) { // If polling is active
        clearInterval(pollingRef.current); // Clear the interval timer
        pollingRef.current = null; // Reset polling ref
      } // End if
      if (abortRef.current) { // If a request is in-flight
        abortRef.current.abort(); // Abort the request
        abortRef.current = null; // Reset abort ref
      } // End if
    } // End if
    // No explicit return; this effect only reacts to enabled changes.
  }, [enabled]); // Dependency on enabled flag only

  return { // Return a stable object for components to consume
    stations, // Current list of stations
    loading, // Loading indicator boolean
    error, // Error encountered during fetch or null
    refresh, // Manual refresh function to trigger immediate fetch
  }; // End returned object
} // End hook function
