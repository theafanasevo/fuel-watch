/**
 * useSearchHistory hook
 *
 * Consumes SearchHistoryContext to provide recent search
 * history state and actions to UI components.
 * All storage logic lives in SearchHistoryProvider.
 */

import { useContext } from "react"; // React context hook
import type { SearchHistoryContextValue } from "../store/SearchHistoryContext"; // Context value type
import { SearchHistoryContext } from "../store/SearchHistoryContext"; // Context object

/**
 * Provides access to search history state and actions.
 * Must be used within a SearchHistoryProvider.
 * @returns Search history context value (searches, addSearch, clearHistory).
 * @throws Error if used outside SearchHistoryProvider.
 */
export function useSearchHistory(): SearchHistoryContextValue {
  const context = useContext(SearchHistoryContext); // Get context value

  if (context === undefined) {
    throw new Error(
      "useSearchHistory must be used within a SearchHistoryProvider",
    ); // Guard against missing provider
  }

  return context; // Return context value
}
