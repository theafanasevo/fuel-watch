/**
 * src/core/providers/AppProviders.tsx
 *
 * This component acts as a wrapper for the entire application,
 * nesting all necessary Context providers in the correct order.
 * It ensures that all parts of the application have access to
 * global state and functionalities provided by these contexts.
 */

import type { ReactNode } from "react"; // Import ReactNode for children prop typing
import { LanguageProvider } from "../../store/LanguageProvider"; // Import LanguageProvider for i18n
import { FavoritesProvider } from "../../store/FavoritesProvider"; // Import FavoritesProvider for favorite stations
import { SearchHistoryProvider } from "../../store/SearchHistoryProvider"; // Import SearchHistoryProvider for recent searches

/**
 * Props interface for the AppProviders component.
 */
interface AppProvidersProps {
  children: ReactNode; // The child components to be rendered within the providers
}

/**
 * AppProviders component.
 * Wraps the entire application with all necessary Context providers
 * in the correct nesting order: Language, Favorites, and Search History.
 *
 * @param {AppProvidersProps} { children } The children components to be wrapped.
 * @returns {ReactNode} The wrapped children within all context providers.
 */
export function AppProviders({ children }: AppProvidersProps): ReactNode {
  return (
    // Outermost provider: LanguageProvider for internationalization
    <LanguageProvider>
      {/* Next provider: FavoritesProvider for managing favorite fuel stations */}
      <FavoritesProvider>
        {/* Innermost provider: SearchHistoryProvider for managing recent search queries */}
        <SearchHistoryProvider>{children}</SearchHistoryProvider>
      </FavoritesProvider>
    </LanguageProvider>
  );
}
