// Utility helpers for LocalStorage with type-safety and versioning. // file purpose
// Follow project rules: try-catch wrappers, version keys, and no side-effects. // design note

// Prefix for all keys stored by the app to avoid collisions. // constant purpose
const STORAGE_PREFIX = 'fuel-watch'; // prefix value

// Default schema version used when storing values without explicit version. // constant purpose
const DEFAULT_VERSION = 1; // default version

// Type describing a stored record with a schema version and a typed value. // type purpose
export type StorageRecord<T> = { // exported generic type
  version: number; // numeric schema version
  value: T; // stored value of generic type
}; // end type

// Build a safe storage key with the global prefix and the provided key. // function purpose
export function buildKey(key: string): string { // named export function
  return `${STORAGE_PREFIX}:${key}`; // combine prefix and key
} // end buildKey

// Safely serialize and save a value to LocalStorage with an associated version. // function purpose
export function setItem<T>(key: string, value: T, version = DEFAULT_VERSION): boolean { // named export function
  try { // try to stringify and store
    const record: StorageRecord<T> = { version, value }; // create typed record
    const raw = JSON.stringify(record); // convert record to JSON string
    localStorage.setItem(buildKey(key), raw); // persist to LocalStorage
    return true; // indicate success
  } catch (err) { // catch serialization or storage errors
    console.error('storage:setItem failed', String(err)); // log error for diagnostics
    return false; // indicate failure
  } // end try-catch
} // end setItem

// Safely retrieve a typed value from LocalStorage, optionally validating version. // function purpose
export function getItem<T>(key: string, expectedVersion?: number): T | null { // named export function
  try { // try to read and parse
    const raw = localStorage.getItem(buildKey(key)); // read raw JSON string
    if (!raw) return null; // nothing stored for this key
    const record = JSON.parse(raw) as StorageRecord<T>; // parse and cast to StorageRecord
    if (expectedVersion !== undefined && record.version !== expectedVersion) { // version mismatch handling
      return null; // indicate schema/version mismatch
    } // end if
    return record.value; // return the typed stored value
  } catch (err) { // catch JSON parse or storage access errors
    console.error('storage:getItem failed', String(err)); // log error for diagnostics
    return null; // return null on error
  } // end try-catch
} // end getItem

// Remove a key from LocalStorage in a safe manner. // function purpose
export function removeItem(key: string): boolean { // named export function
  try { // try to remove
    localStorage.removeItem(buildKey(key)); // remove the item
    return true; // indicate success
  } catch (err) { // catch removal errors
    console.error('storage:removeItem failed', String(err)); // log error for diagnostics
    return false; // indicate failure
  } // end try-catch
} // end removeItem

// Clear all app-prefixed keys from LocalStorage. // function purpose
export function clearAppStorage(): boolean { // named export function
  try { // try to iterate and remove keys
    const keysToRemove: string[] = []; // accumulator for keys to delete
    for (let i = 0; i < localStorage.length; i += 1) { // iterate over storage entries
      const fullKey = localStorage.key(i); // get key by index
      if (!fullKey) continue; // skip if null
      if (fullKey.startsWith(`${STORAGE_PREFIX}:`)) { // check prefix
        keysToRemove.push(fullKey); // schedule for removal
      } // end if
    } // end for
    for (const k of keysToRemove) { // remove scheduled keys
      localStorage.removeItem(k); // remove each key
    } // end for
    return true; // indicate success
  } catch (err) { // catch iteration or removal errors
    console.error('storage:clearAppStorage failed', String(err)); // log error for diagnostics
    return false; // indicate failure
  } // end try-catch
} // end clearAppStorage

// List all app-prefixed keys currently stored (without prefix). // function purpose
export function listKeys(): string[] { // named export function
  try { // try to collect keys
    const result: string[] = []; // initialize result array
    for (let i = 0; i < localStorage.length; i += 1) { // iterate storage
      const fullKey = localStorage.key(i); // get the full key string
      if (!fullKey) continue; // skip null keys
      const prefix = `${STORAGE_PREFIX}:`; // compute prefix to compare
      if (fullKey.startsWith(prefix)) { // check for prefix match
        result.push(fullKey.slice(prefix.length)); // push key without prefix
      } // end if
    } // end for
    return result; // return collected keys
  } catch (err) { // catch errors during iteration
    console.error('storage:listKeys failed', String(err)); // log error for diagnostics
    return []; // return empty array on failure
  } // end try-catch
} // end listKeys

// Migrate a stored record using a migration function when versions differ. // function purpose
export function migrateItem<T, U>( // named export generic function
  key: string, // storage key to migrate
  migrateFn: (oldValue: T | null, oldVersion?: number) => { value: U; version: number } | null, // migration function signature
): boolean { // returns boolean success
  try { // try to read, migrate, and write back
    const raw = localStorage.getItem(buildKey(key)); // read raw record
    let oldRecord: StorageRecord<T> | null = null; // placeholder for parsed record
    if (raw) { // if there is stored data
      oldRecord = JSON.parse(raw) as StorageRecord<T>; // parse existing record
    } // end if
    const migrationResult = migrateFn(oldRecord ? oldRecord.value : null, oldRecord ? oldRecord.version : undefined); // run migration
    if (!migrationResult) return false; // if migration did not produce a result, abort
    const newRecord: StorageRecord<U> = { version: migrationResult.version, value: migrationResult.value }; // build new record
    localStorage.setItem(buildKey(key), JSON.stringify(newRecord)); // persist migrated record
    return true; // indicate success
  } catch (err) { // catch parsing or storage errors
    console.error('storage:migrateItem failed', String(err)); // log error for diagnostics
    return false; // indicate failure
  } // end try-catch
} // end migrateItem

// Lightweight helper that wraps getItem and returns a fallback when missing. // function purpose
export function getItemOr<T>(key: string, fallback: T, expectedVersion?: number): T { // named export function
  const val = getItem<T>(key, expectedVersion); // attempt to get stored value
  return val === null ? fallback : val; // return fallback when null, otherwise the value
} // end getItemOr

// Expose defaults for external modules to use when storing domain data. // comment
export const defaults = { // exported defaults object
  defaultVersion: DEFAULT_VERSION, // default schema version
  storagePrefix: STORAGE_PREFIX, // storage prefix exported
}; // end defaults object
