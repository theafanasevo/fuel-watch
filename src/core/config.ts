/**
 * src/core/config.ts
 *
 * Application configuration and environment variable accessors.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */ // disable if needed for import.meta typing

import type { FuelType } from "../types/fuel"; // Import FuelType for type safety

/**
 * Define known environment keys as a union type.
 */
export type EnvKey =
  | "VITE_TANKER_KEY" // Tankerkoenig API key
  | "VITE_TANKER_URL" // Tankerkoenig API base URL
  | "VITE_PHOTON_URL" // Photon geocoder URL
  | "VITE_POLL_INTERVAL_MS" // Polling interval in milliseconds
  | "VITE_API_TIMEOUT_MS" // API timeout in milliseconds
  | "VITE_APP_NAME" // Application name
  | "VITE_PWA_ENABLED" // PWA feature flag
  | "VITE_DEFAULT_LAT" // Default latitude for searches
  | "VITE_DEFAULT_LNG" // Default longitude for searches
  | "VITE_DEFAULT_RADIUS" // Default search radius in km
  | "VITE_DEFAULT_FUEL_TYPE"; // Default fuel type for searches

/**
 * Cast import.meta.env to a safe record of strings to undefined.
 */
const rawEnv = (
  import.meta as unknown as { env: Record<string, string | undefined> }
).env; // Read Vite environment variables

/**
 * Retrieve a raw environment string by key.
 * @param key The environment variable key.
 * @param required If true, throws an error if the variable is missing.
 * @returns The environment variable's string value, or undefined.
 */
export function getEnvString(
  key: EnvKey,
  required = false,
): string | undefined {
  const value = rawEnv[key]; // Look up the value
  if (required && (value === undefined || value === "")) {
    // Check if required and missing
    throw new Error(`Missing required environment variable: ${key}`); // Throw a descriptive error
  }
  return value; // Return the value or undefined
}

/**
 * Retrieve an environment value parsed as a number with a default fallback.
 * @param key The environment variable key.
 * @param fallback The default number to return if the variable is missing or invalid.
 * @returns The parsed number or the fallback.
 */
export function getEnvNumber(key: EnvKey, fallback: number): number {
  const raw = getEnvString(key); // Get the raw string value
  if (raw === undefined || raw === "") {
    // Check if the value is missing
    return fallback; // Return the fallback number
  }
  const parsed = parseFloat(raw); // Parse to a floating-point number
  if (Number.isNaN(parsed)) {
    // Guard against NaN
    return fallback; // Return the fallback on parse failure
  }
  return parsed; // Return the parsed number
}

/**
 * Retrieve an environment value parsed as a boolean with a default fallback.
 * @param key The environment variable key.
 * @param fallback The default boolean to return if the variable is missing or invalid.
 * @returns The parsed boolean or the fallback.
 */
export function getEnvBoolean(key: EnvKey, fallback: boolean): boolean {
  const raw = getEnvString(key); // Get the raw string value
  if (raw === undefined || raw === "") {
    // Check if the value is missing
    return fallback; // Return the fallback boolean
  }
  const lowered = raw.toLowerCase(); // Normalize case for comparison
  if (lowered === "true" || lowered === "1") {
    // Check for "true" values
    return true; // Return true
  }
  if (lowered === "false" || lowered === "0") {
    // Check for "false" values
    return false; // Return false
  }
  return fallback; // Return the fallback for unknown values
}

/**
 * Application-level typed configuration object.
 */
export interface AppConfig {
  tankerApiKey: string; // Tankerkönig API key
  tankerApiUrl: string; // Tankerkönig API base URL
  photonUrl: string; // Photon geocoder URL
  pollIntervalMs: number; // Polling interval in milliseconds
  apiTimeoutMs: number; // API timeout in milliseconds
  appName: string; // Application display name
  pwaEnabled: boolean; // PWA features enabled flag
  defaultLat: number; // Default latitude for searches
  defaultLng: number; // Default longitude for searches
  defaultRadius: number; // Default search radius in km
  defaultFuelType: FuelType; // Default fuel type for searches
}

let cachedConfig: AppConfig | undefined; // Cache for the configuration object

/**
 * Returns the application's configuration, caching the result.
 * This function retrieves and parses environment variables.
 * It will log a warning if the Tankerkönig API key is missing.
 * @returns A frozen object containing the application configuration.
 */
export function getConfig(): AppConfig {
  if (cachedConfig) {
    // Check if config is already cached
    return cachedConfig; // Return the cached configuration
  }

  const tankerApiKey = getEnvString("VITE_TANKER_KEY"); // Get Tankerkönig API key
  if (!tankerApiKey) {
    // Check if API key is empty
    console.warn(
      "VITE_TANKER_KEY is not set. Tankerkönig API access will be limited or fail.",
    ); // Warn about missing API key
  }

  const config: AppConfig = {
    // Define the configuration object
    tankerApiKey: tankerApiKey ?? "", // Use empty string if key is undefined
    tankerApiUrl:
      getEnvString("VITE_TANKER_URL") ??
      "https://creativecommons.tankerkoenig.de", // Tankerkönig base URL with safe default
    photonUrl: getEnvString("VITE_PHOTON_URL") ?? "https://photon.komoot.io", // Photon geocoder URL default
    pollIntervalMs: getEnvNumber("VITE_POLL_INTERVAL_MS", 300000), // Polling interval default 5 minutes
    apiTimeoutMs: getEnvNumber("VITE_API_TIMEOUT_MS", 10000), // API timeout default 10s
    appName: getEnvString("VITE_APP_NAME") ?? "Fuel-Watch", // Application display name default
    pwaEnabled: getEnvBoolean("VITE_PWA_ENABLED", true), // Whether PWA features are enabled
    defaultLat: getEnvNumber("VITE_DEFAULT_LAT", 52.52), // Default latitude (Berlin)
    defaultLng: getEnvNumber("VITE_DEFAULT_LNG", 13.405), // Default longitude (Berlin)
    defaultRadius: getEnvNumber("VITE_DEFAULT_RADIUS", 10), // Default search radius in km
    defaultFuelType:
      (getEnvString("VITE_DEFAULT_FUEL_TYPE") as FuelType) ?? "e5", // Default fuel type, cast to FuelType
  };

  cachedConfig = Object.freeze(config); // Cache and freeze the configuration
  return cachedConfig; // Return the frozen configuration
}

/**
 * Convenience accessor for tests or other modules that need env lookup.
 * Throws an error if the environment variable is missing.
 * @param key The environment variable key.
 * @returns The string value of the required environment variable.
 */
export function requireEnv(key: EnvKey): string {
  return getEnvString(key, true) as string; // Return required env string
}
