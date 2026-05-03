/**
 * src/store/FavoritesContext.ts
 *
 * Defines the React Context for managing user's favorite fuel stations.
 * This file declares the shape of the context value and exports the
 * context object itself, which will be consumed by the FavoritesProvider.
 */

import { createContext } from "react"; // Import createContext from React

/**
 * Defines the structure of the value provided by the FavoritesContext.
 * This includes the list of favorite station IDs and functions to manage them.
 */
export interface FavoritesContextValue {
  favoriteIds: readonly string[]; // An array of read-only string IDs for favorite stations
  addFavorite: (id: string) => void; // Function to add a station to favorites
  removeFavorite: (id: string) => void; // Function to remove a station from favorites
  isFavorite: (id: string) => boolean; // Function to check if a station is a favorite
}

/**
 * The React Context object for managing favorite fuel stations.
 * It is initialized with `undefined` and is expected to be provided
 * by a `FavoritesProvider` higher in the component tree.
 */
export const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
); // Create the context with an undefined default value
