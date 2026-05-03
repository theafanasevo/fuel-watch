import { createContext } from "react"; // createContext import
import type { RecentSearch } from "../types/storage"; // RecentSearch type

/** Shape of the search history context value. */
export interface SearchHistoryContextValue {
  searches: readonly RecentSearch[]; // Array of recent searches
  addSearch: (search: RecentSearch) => void; // Add a new search
  clearHistory: () => void; // Clear all search history
}

/** Search history context, undefined when outside provider. */
export const SearchHistoryContext = createContext<
  SearchHistoryContextValue | undefined
>(undefined); // Create context with undefined default
