/**
 * fuel-watch/src/hooks/useRecentSearches.ts
 * Hook to manage recent searches (FIFO, max 5) using LocalStorage.
 */ // file header comment
import { useCallback, useEffect, useState } from 'react'; // import React hooks needed for local state and effects
// Maximum number of saved recent searches to keep in storage.
const MAX_RECENT = 5; // constant for maximum history length
// Storage key used to persist recent searches in LocalStorage.
const STORAGE_KEY = 'fuel-watch:recent-searches:v1'; // versioned key to allow migrations later
// Local shape for a recent search entry used by this hook.
export interface RecentSearch { // exported type representing a recent search
  query: string; // the raw search query text
  timestamp: number; // epoch ms when the search was performed
} // end RecentSearch interface
// Read the current recent searches from LocalStorage in a safe way.
function readFromStorage(): RecentSearch[] { // function to safely read stored items
  try { // try reading and parsing storage
    const raw = localStorage.getItem(STORAGE_KEY); // read raw JSON string from LocalStorage
    if (!raw) return []; // return empty array when nothing stored
    const parsed = JSON.parse(raw) as RecentSearch[]; // parse JSON into typed array
    if (!Array.isArray(parsed)) return []; // guard against non-array payloads
    return parsed.slice(0, MAX_RECENT); // return at most MAX_RECENT items
  } catch (err) { // catch JSON parse or access errors
    // If reading fails (private mode, corrupt data), return empty and keep app usable.
    return []; // fallback to empty array on any error
  } // end try-catch
} // end readFromStorage
// Write the provided recent searches array into LocalStorage safely.
function writeToStorage(items: RecentSearch[]): void { // function to persist items
  try { // try serializing and saving
    const toStore = JSON.stringify(items.slice(0, MAX_RECENT)); // serialize trimmed array to JSON
    localStorage.setItem(STORAGE_KEY, toStore); // persist JSON string into LocalStorage
  } catch (err) { // catch serialization or storage errors
    // Swallow errors intentionally to avoid breaking the UI in private mode.
  } // end try-catch
} // end writeToStorage
/**
 * useRecentSearches hook
 *
 * Provides the current recent searches list and functions to push a new search
 * or clear the history. Persisted in LocalStorage with FIFO eviction.
 */ // JSDoc for the hook
export function useRecentSearches() { // named export for the hook
  const [items, setItems] = useState<RecentSearch[]>(() => { // state initialized from storage on first render
    return readFromStorage(); // initialize state by reading storage
  }); // end useState
  // Push a new query into the recent searches, keeping most recent first.
  const push = useCallback((query: string) => { // memoized push function
    if (!query || query.trim() === '') return; // ignore empty queries
    const entry: RecentSearch = { query: query.trim(), timestamp: Date.now() }; // build new entry with timestamp
    setItems((prev) => { // update local state with previous items
      const filtered = prev.filter((p) => p.query !== entry.query); // remove duplicates of same query
      const next = [entry, ...filtered].slice(0, MAX_RECENT); // prepend and trim to MAX_RECENT
      writeToStorage(next); // persist new list to storage
      return next; // return next state
    }); // end setItems
  }, []); // dependency array for push
  // Clear all recent searches from state and storage.
  const clear = useCallback(() => { // memoized clear function
    setItems([]); // clear local state array
    try { // try removing key from LocalStorage
      localStorage.removeItem(STORAGE_KEY); // remove persisted key
    } catch (err) { // catch storage errors
      // ignore errors to keep UI functional
    } // end try-catch
  }, []); // dependency array for clear
  // Sync with external changes to LocalStorage (e.g., another tab) by listening to storage events.
  useEffect(() => { // set up storage event listener on mount
    function onStorage(e: StorageEvent) { // handler for storage events
      if (e.key !== STORAGE_KEY) return; // ignore unrelated keys
      setItems(readFromStorage()); // refresh state from storage when key changes
    } // end onStorage
    window.addEventListener('storage', onStorage); // register storage event listener
    return () => { // cleanup on unmount
      window.removeEventListener('storage', onStorage); // remove listener to avoid leaks
    }; // end cleanup
  }, []); // run effect once
  // Expose the API surface for components: items, push and clear.
  return { items, push, clear }; // return hook API
} // end useRecentSearches
