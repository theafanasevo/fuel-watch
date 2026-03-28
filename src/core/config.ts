/**
 * core/config.ts
 *
 * Application configuration and environment variable accessors. // file purpose
 */ // end file comment

/* eslint-disable @typescript-eslint/no-explicit-any */ // disable if needed for import.meta typing

/** // Define known environment keys as a union type. */ // comment
export type EnvKey = // export EnvKey
  | 'VITE_TANKER_KEY' // tanker API key
  | 'VITE_TANKER_URL' // tanker API base URL
  | 'VITE_PHOTON_URL' // photon geocoder URL
  | 'VITE_POLL_INTERVAL_MS' // polling interval in ms
  | 'VITE_API_TIMEOUT_MS' // API timeout in ms
  | 'VITE_APP_NAME' // application name
  | 'VITE_PWA_ENABLED' // PWA feature flag
  ; // end type

/** // Cast import.meta.env to a safe record of strings to undefined. */ // comment
const rawEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env; // read Vite env

/** // Retrieve a raw environment string by key. */ // comment
export function getEnvString(key: EnvKey, required = false): string | undefined { // function signature
  const value = rawEnv[key]; // look up value
  if (required && (value === undefined || value === '')) { // required check
    throw new Error(`Missing required environment variable: ${key}`); // throw descriptive error
  } // end if
  return value; // return value or undefined
} // end function

/** // Retrieve an environment value parsed as number with a default. */ // comment
export function getEnvNumber(key: EnvKey, fallback: number): number { // function signature
  const raw = getEnvString(key); // get raw string
  if (raw === undefined || raw === '') { // missing case
    return fallback; // return fallback number
  } // end if
  const parsed = Number(raw); // parse to number
  if (Number.isNaN(parsed)) { // NaN guard
    return fallback; // return fallback on parse failure
  } // end if
  return parsed; // return parsed number
} // end function

/** // Retrieve an environment value parsed as boolean with a default. */ // comment
export function getEnvBoolean(key: EnvKey, fallback: boolean): boolean { // function signature
  const raw = getEnvString(key); // get raw string
  if (raw === undefined || raw === '') { // missing case
    return fallback; // return fallback boolean
  } // end if
  const lowered = raw.toLowerCase(); // normalize case
  if (lowered === 'true' || lowered === '1') { // true values
    return true; // return true
  } // end if
  if (lowered === 'false' || lowered === '0') { // false values
    return false; // return false
  } // end if
  return fallback; // return fallback for unknown values
} // end function

/** // Application-level typed configuration object. */ // comment
export const config = { // export config object
  tankerKey: getEnvString('VITE_TANKER_KEY', true) as string, // Tankerkönig API key (required)
  tankerUrl: getEnvString('VITE_TANKER_URL') ?? 'https://creativecommons.tankerkoenig.de', // tanker base URL with safe default
  photonUrl: getEnvString('VITE_PHOTON_URL') ?? 'https://photon.komoot.io', // Photon geocoder URL default
  pollIntervalMs: getEnvNumber('VITE_POLL_INTERVAL_MS', 300000), // polling interval default 5 minutes
  apiTimeoutMs: getEnvNumber('VITE_API_TIMEOUT_MS', 10000), // API timeout default 10s
  appName: getEnvString('VITE_APP_NAME') ?? 'Fuel-Watch', // application display name default
  pwaEnabled: getEnvBoolean('VITE_PWA_ENABLED', true), // whether PWA features are enabled
} as const; // freeze shape as readonly

/** // Exported type for the config object to assist callers with full typing. */ // comment
export type AppConfig = typeof config; // export AppConfig type

/** // Convenience accessor for tests or other modules that need env lookup. */ // comment
export function requireEnv(key: EnvKey): string { // function that throws if missing
  return getEnvString(key, true) as string; // return required env string
} // end function

/** // Next step suggestion: wire this config into core/providers and api clients. */ // comment
