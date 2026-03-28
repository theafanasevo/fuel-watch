/**
 * src/api/photon.ts
 *
 * Pure HTTP client for the Photon geocoding API (photon.komoot.io).
 * - Exports typed functions that return PhotonResult[].
 * - Filters results to Germany and limits number of results.
 *
 * Notes:
 * - Uses Vite-provided PHOTON_API_URL and PHOTON_MAX_RESULTS constants.
 * - Throws Error('networkError') on network failures and Error('apiError') on unexpected responses.
 */

import type {
  PhotonResult,
  PhotonFeature,
  PhotonFeatureCollection,
} from "../types/geo"; // import Photon types

import { PHOTON_API_URL, PHOTON_MAX_RESULTS } from "../utils/constants"; // constants

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Transform a Photon GeoJSON Feature into a simplified PhotonResult used by the app.
 *
 * @param feature - Photon GeoJSON Feature
 * @returns PhotonResult - simplified result with id, name, coordinates and optional extras
 */
function transformFeatureToResult(feature: PhotonFeature): PhotonResult {
  // Attempt to build a stable id using feature.id or osm_type/osm_id if available.
  const rawId =
    feature.id ??
    (feature.properties?.osm_type && feature.properties?.osm_id
      ? `${feature.properties.osm_type}/${feature.properties.osm_id}`
      : undefined);
  const lon = feature.geometry?.coordinates?.[0] ?? 0;
  const lat = feature.geometry?.coordinates?.[1] ?? 0;

  return {
    id: String(rawId ?? `${lat}:${lon}`),
    name:
      (feature.properties?.name ??
        // fallback to composed address-like string when name missing
        [
          feature.properties?.street,
          feature.properties?.housenumber,
          feature.properties?.city ||
            feature.properties?.town ||
            feature.properties?.village,
        ]
          .filter(Boolean)
          .join(" ")
          .trim()) ||
      String(feature.id ?? `${lat},${lon}`),
    coordinates: {
      lat: Number(lat),
      lon: Number(lon),
    },
    countrycode: feature.properties?.countrycode,
    properties: feature.properties ?? undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Search locations using the Photon API (search-as-you-type).
 *
 * - Filters results to Germany only (countrycode=DE).
 * - Limits results to PHOTON_MAX_RESULTS by request and slice as a safeguard.
 * - Gracefully maps network failures to Error('networkError') and API issues to Error('apiError').
 *
 * @param query - user entered search text (city, PLZ, address)
 * @returns Promise<PhotonResult[]> - array of simplified Photon results
 *
 * @throws Error('networkError') when fetch fails due to network issues
 * @throws Error('apiError') when the API returns an unexpected shape or status
 */
export async function searchLocation(query: string): Promise<PhotonResult[]> {
  // Basic validation
  if (!query || typeof query !== "string" || query.trim() === "") {
    return []; // return empty for empty queries (caller can decide)
  }

  // Build request URL from configured base
  let url: URL;
  try {
    url = new URL(PHOTON_API_URL);
  } catch {
    // If PHOTON_API_URL is malformed, fallback to known host
    url = new URL("https://photon.komoot.io/api");
  }

  // Ensure we target the search endpoint (base may already include /api)
  // Photon accepts q, limit and countrycode query params.
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(PHOTON_MAX_RESULTS ?? 5));
  url.searchParams.set("countrycode", "DE"); // filter to Germany only

  let resp: Response;
  try {
    resp = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    // Network-level error (DNS, CORS, offline, etc.)
    throw new Error("networkError");
  }

  // Non-2xx HTTP status handling
  if (!resp.ok) {
    // For 429/503 we could map to specific keys; keep generic apiError for now.
    throw new Error("apiError");
  }

  // Parse JSON payload
  let payload: unknown;
  try {
    payload = await resp.json();
  } catch {
    throw new Error("apiError");
  }

  // Basic validation of expected GeoJSON FeatureCollection shape
  const fc = payload as PhotonFeatureCollection | undefined;
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    throw new Error("apiError");
  }

  // Transform and filter features to PhotonResult, ensuring countrycode === 'de'
  const results: PhotonResult[] = fc.features
    .filter(Boolean)
    .filter((f) => {
      const cc = (f.properties?.countrycode ?? "") as string;
      return cc.toLowerCase() === "de";
    })
    .map((f) => transformFeatureToResult(f))
    .slice(0, PHOTON_MAX_RESULTS); // safety slice

  return results;
}

/* Default export for convenience */
export default { searchLocation };
