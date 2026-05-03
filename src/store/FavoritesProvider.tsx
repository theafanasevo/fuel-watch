/**
 * src/store/FavoritesProvider.tsx
 *
 * This module provides the FavoritesProvider component, which manages
 * the global state of user's favorite fuel stations using `useReducer`.
 * It persists the favorites list to `localStorage` and exposes an API
 * to add, remove, and check favorite stations via the FavoritesContext.
 */

import { useEffect, useReducer, type ReactNode } from "react"; // Import React hooks and types
import {
  FavoritesContext,
  type FavoritesContextValue,
} from "./FavoritesContext"; // Import FavoritesContext and its value type
import { readFromStorage, writeToStorage } from "../utils/storage"; // Import type-safe localStorage helpers

/**
 * The key used to store favorite station IDs in localStorage.
 */
const LOCAL_STORAGE_KEY = "fuel-watch-favorites-v1";

/**
 * Interface for the state managed by the FavoritesProvider.
 */
interface FavoritesState {
  favoriteIds: readonly string[]; // A read-only array of favorite station IDs
}

/**
 * Union type for all possible actions that can be dispatched to the favorites reducer.
 */
type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: string } // Action to add a favorite
  | { type: "REMOVE_FAVORITE"; payload: string } // Action to remove a favorite
  | { type: "LOAD_FAVORITES"; payload: readonly string[] }; // Action to load favorites from storage

/**
 * Reducer function to handle state changes for favorite stations.
 * @param state The current FavoritesState.
 * @param action The action to be performed.
 * @returns The new FavoritesState.
 */
function favoritesReducer(
  state: FavoritesState,
  action: FavoritesAction,
): FavoritesState {
  switch (action.type) {
    case "ADD_FAVORITE":
      // Add favorite only if it's not already present
      if (!state.favoriteIds.includes(action.payload)) {
        return {
          ...state,
          favoriteIds: [...state.favoriteIds, action.payload],
        }; // Return new state with added favorite
      }
      return state; // Return current state if already a favorite
    case "REMOVE_FAVORITE":
      return {
        ...state,
        favoriteIds: state.favoriteIds.filter((id) => id !== action.payload),
      }; // Return new state with favorite removed
    case "LOAD_FAVORITES":
      return { ...state, favoriteIds: action.payload }; // Replace entire array with loaded favorites
    default:
      return state; // Return current state for unknown actions
  }
}

/**
 * Props interface for the FavoritesProvider component.
 */
interface FavoritesProviderProps {
  children: ReactNode; // The child components to be wrapped by the provider
}

/**
 * FavoritesProvider component.
 * Manages the global state of user's favorite fuel stations,
 * persists them to localStorage, and makes the management functions
 * available to child components via FavoritesContext.
 *
 * @param {FavoritesProviderProps} { children } The child components to be wrapped.
 * @returns {ReactNode} The wrapped children within the FavoritesContext.Provider.
 */
export function FavoritesProvider({
  children,
}: FavoritesProviderProps): ReactNode {
  const [state, dispatch] = useReducer(favoritesReducer, {
    favoriteIds: [],
  }); // Initialize state with an empty array of favorite IDs

  // Effect to load favorite IDs from localStorage on component mount
  useEffect(() => {
    const storedFavorites = readFromStorage<string[]>(LOCAL_STORAGE_KEY); // Load favorites from localStorage
    if (storedFavorites) {
      dispatch({ type: "LOAD_FAVORITES", payload: storedFavorites }); // Dispatch action to load stored favorites
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // Effect to persist favorite IDs to localStorage whenever the state changes
  useEffect(() => {
    writeToStorage(LOCAL_STORAGE_KEY, state.favoriteIds); // Save current favorite IDs to localStorage
  }, [state.favoriteIds]); // Dependency array: run when favoriteIds array changes

  /**
   * Adds a station ID to the list of favorite IDs.
   * @param id The ID of the station to add.
   */
  const addFavorite = (id: string): void => {
    dispatch({ type: "ADD_FAVORITE", payload: id }); // Dispatch action to add a favorite
  };

  /**
   * Removes a station ID from the list of favorite IDs.
   * @param id The ID of the station to remove.
   */
  const removeFavorite = (id: string): void => {
    dispatch({ type: "REMOVE_FAVORITE", payload: id }); // Dispatch action to remove a favorite
  };

  /**
   * Checks if a given station ID is present in the favorite IDs list.
   * @param id The ID of the station to check.
   * @returns True if the station is a favorite, false otherwise.
   */
  const isFavorite = (id: string): boolean => {
    return state.favoriteIds.includes(id); // Check if the ID exists in the favoriteIds array
  };

  // The value provided to consumers of the FavoritesContext
  const contextValue: FavoritesContextValue = {
    favoriteIds: state.favoriteIds, // Provide the current favorite IDs
    addFavorite, // Provide the addFavorite function
    removeFavorite, // Provide the removeFavorite function
    isFavorite, // Provide the isFavorite function
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children} {/* Render children within the provider */}
    </FavoritesContext.Provider>
  );
}
