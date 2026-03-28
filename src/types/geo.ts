// fuel-watch/src/types/geo.ts

/**
 * photon.komoot.io GeoJSON FeatureCollection response.
 * See: https://photon.komoot.io
 */
export interface PhotonFeatureCollection {
  /** GeoJSON object type, should be "FeatureCollection". */
  type: "FeatureCollection";
  /** Array of features returned by Photon for the query. */
  features: PhotonFeature[];
  /** Optional bounding box for the returned set: [minLon, minLat, maxLon, maxLat]. */
  bbox?: number[]; // length 4: [minLon, minLat, maxLon, maxLat]
}

/**
 * Single GeoJSON Feature as returned by Photon.
 */
export interface PhotonFeature {
  /** GeoJSON object type, should be "Feature". */
  type: "Feature";
  /** Geometry object describing the feature location (Point). */
  geometry: PhotonGeometry;
  /** Feature properties containing rich address/place metadata. */
  properties: PhotonProperties;
  /** Optional feature id (may be osm id prefixed). */
  id?: string | number;
  /** Optional bounding box for the feature. */
  bbox?: number[]; // [minLon, minLat, maxLon, maxLat]
}

/**
 * Geometry object for Photon features (Point coordinates).
 */
export interface PhotonGeometry {
  /** GeoJSON geometry type, typically "Point". */
  type: "Point";
  /**
   * Coordinates in [longitude, latitude] order per GeoJSON spec.
   * Index 0 = lon, Index 1 = lat. Additional dimensions (alt) are not expected.
   */
  coordinates: [number, number];
}

/**
 * Normalized coordinate pair with explicit names for convenience.
 */
export interface Coordinates {
  /** Latitude in decimal degrees. */
  lat: number;
  /** Longitude in decimal degrees. */
  lon: number;
}

/**
 * Properties returned by Photon for a feature.
 * This is a best-effort typing that covers commonly returned keys.
 */
export interface PhotonProperties {
  /** Display name for the feature (human-readable). */
  name?: string;
  /** OSM element id (numeric) when available. */
  osm_id?: number;
  /** OSM element type: "node", "way", or "relation". */
  osm_type?: "node" | "way" | "relation";
  /** OSM key associated with this result (e.g. "place", "highway"). */
  osm_key?: string;
  /** OSM value associated with osm_key (e.g. "city", "residential"). */
  osm_value?: string;
  /** Importance score produced by Photon / Nominatim (0..1). */
  importance?: number;
  /** ISO 3166-1 alpha-2 country name string (e.g. "Germany"). */
  country?: string;
  /** Country code (ISO 3166-1 alpha-2, lower-case e.g. "de"). */
  countrycode?: string;
  /** State, region or province name if available. */
  state?: string;
  /** County name if available. */
  county?: string;
  /** City name if available. */
  city?: string;
  /** Town name if available (sometimes used instead of city). */
  town?: string;
  /** Village name if available. */
  village?: string;
  /** Suburb name if available. */
  suburb?: string;
  /** Street name when the result includes a street. */
  street?: string;
  /** House number when present for address-level results. */
  housenumber?: string;
  /** Postal code (postcode) when available. */
  postcode?: string;
  /** Latitude returned as a property (duplicate of geometry coordinates). */
  lat?: number;
  /** Longitude returned as a property (duplicate of geometry coordinates). */
  lon?: number;
  /** Optional distance in meters from request coordinate (when Photon is used in reverse/geosearch contexts). */
  distance?: number;
  /** Raw, provider-specific attribution or extra values. Photon may include other keys; preserve them via index signature. */
  [extra: string]: unknown;
}

/**
 * Convenience type representing a simplified Photon result.
 * Useful for UI/hook layers that prefer named lat/lon and a display name.
 */
export type PhotonResult = {
  /** Unique identifier for this result (constructed from osm_type/osm_id or feature.id). */
  id: string;
  /** Display name to show in UI. */
  name: string;
  /** Normalized coordinates with lat/lon fields. */
  coordinates: Coordinates;
  /** Country code (if available). */
  countrycode?: string;
  /** Raw properties blob for advanced usage or debugging. */
  properties?: PhotonProperties;
};
