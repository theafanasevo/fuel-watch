/**
 * SearchHistoryProvider component.
 * Manages recent search history via useReducer,
 * persists to localStorage, and provides context to children.
 */

import { useEffect, useReducer, type ReactNode } from "react"; // React hooks and types
import type { RecentSearch } from "../types/storage"; // RecentSearch type import
import { getRecentSearches, writeToStorage } from "../utils/storage"; // Storage helpers
import type { SearchHistoryContextValue } from "./SearchHistoryContext"; // Context value type
import { SearchHistoryContext } from "./SearchHistoryContext"; // Context object

/** localStorage key for search history. */
const STORAGE_KEY = "fuel-watch-searches-v1"; // Storage key constant

/** Shape of the search history reducer state. */
interface SearchHistoryState {
  searches: readonly RecentSearch[]; // Array of recent searches
}

/** Action types for the search history reducer. */
type SearchHistoryAction =
  | { type: "ADD_SEARCH"; payload: RecentSearch } // Add a search
  | { type: "CLEAR_HISTORY" } // Clear all history
  | { type: "LOAD_HISTORY"; payload: readonly RecentSearch[] }; // Hydrate from storage

/** Maximum number of recent searches to keep. */
const MAX_SEARCHES = 5; // FIFO limit

/**
 * Reducer function to handle search history state changes.
 * @param state - The current search history state.
 * @param action - The action to perform.
 * @returns The new search history state.
 */
function searchHistoryReducer(
  state: SearchHistoryState,
  action: SearchHistoryAction,
): SearchHistoryState {
  switch (action.type) {
    case "ADD_SEARCH": {
      const filtered = state.searches.filter(
        (s) => s.query !== action.payload.query, // Remove duplicate by query
      );
      const updated = [action.payload, ...filtered]; // Prepend new search
      return { searches: updated.slice(0, MAX_SEARCHES) }; // Enforce max limit
    }
    case "CLEAR_HISTORY":
      return { searches: [] }; // Reset to empty array
    case "LOAD_HISTORY":
      return { searches: action.payload }; // Replace with loaded data
    default:
      return state; // Return current state for unknown actions
  }
}

/** Props interface for the SearchHistoryProvider component. */
interface SearchHistoryProviderProps {
  children: ReactNode; // Child components to wrap
}

/**
 * Provides search history state and actions to the component tree.
 * Hydrates from localStorage on mount and persists on every change.
 * @param props - Component props containing children.
 * @returns The provider-wrapped children.
 */
export function SearchHistoryProvider({
  children,
}: SearchHistoryProviderProps): ReactNode {
  const [state, dispatch] = useReducer(searchHistoryReducer, {
    searches: [], // Initialize with empty array, hydrate in useEffect
  });

  /** Hydrate state from localStorage on mount. */
  useEffect(() => {
    const stored = getRecentSearches(); // Load from localStorage
    if (stored.length > 0) {
      dispatch({ type: "LOAD_HISTORY", payload: stored }); // Hydrate state
    }
  }, []); // Run only on mount

  /** Persist searches to localStorage on every change. */
  useEffect(() => {
    if (state.searches.length > 0) {
      writeToStorage(STORAGE_KEY, state.searches); // Save to localStorage
    }
  }, [state.searches]); // Run when searches change

  /** Adds a search to history. */
  const addSearch = (search: RecentSearch): void => {
    dispatch({ type: "ADD_SEARCH", payload: search }); // Dispatch add action
  };

  /** Clears all search history. */
  const clearHistory = (): void => {
    dispatch({ type: "CLEAR_HISTORY" }); // Dispatch clear action
  };

  /** Context value object. */
  const value: SearchHistoryContextValue = {
    searches: state.searches, // Current searches array
    addSearch, // Add search function
    clearHistory, // Clear history function
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children} {/* Render children within provider */}
    </SearchHistoryContext.Provider>
  );
}
