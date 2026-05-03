/**
 * Custom hook to access the language context.
 * Throws an error if used outside of a LanguageProvider.
 */

import { useContext } from "react"; // React context hook
import type { Language } from "../store/LanguageContext"; // Language type
import { LanguageContext } from "../store/LanguageContext"; // Context object

export function useLanguage(): {
  language: Language;
  setLanguage: (lang: Language) => void;
} {
  const context = useContext(LanguageContext); // Get context value

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context; // Return the context value
}
