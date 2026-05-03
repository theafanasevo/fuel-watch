import { createContext } from "react"; // createContext import

/** Supported language codes. */
export type Language = "de" | "en" | "tr"; // Union type for languages

/** Shape of the language context value. */
export interface LanguageContextValue {
  // Context value interface
  language: Language; // Current language
  setLanguage: (lang: Language) => void; // Language setter function
}

/** Language context, undefined when outside provider. */
export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
); // Create context with undefined default
