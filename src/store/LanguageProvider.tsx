/**
 * LanguageProvider component.
 * Manages global language state via useReducer,
 * persists to localStorage, and provides context to children.
 */

import { useEffect, useReducer, type ReactNode } from "react"; // React hooks and types
import { readFromStorage, writeToStorage } from "../utils/storage"; // Type-safe localStorage helpers
import type { Language, LanguageContextValue } from "./LanguageContext"; // Type imports from context
import { LanguageContext } from "./LanguageContext"; // Context object import

/** The localStorage key for language preference. */
const LOCAL_STORAGE_KEY = "fuel-watch-lang"; // Storage key constant

/** Shape of the language reducer state. */
interface LanguageState {
  language: Language; // The currently selected language
}

/** Action type for the language reducer. */
interface LanguageAction {
  type: "SET_LANGUAGE"; // Action type identifier
  payload: Language; // The new language to set
}

/**
 * Reducer function to handle language state changes.
 * @param state - The current language state.
 * @param action - The action to perform.
 * @returns The new language state.
 */
function languageReducer(
  state: LanguageState,
  action: LanguageAction,
): LanguageState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return { ...state, language: action.payload }; // Update language in state
    default:
      return state; // Return current state for unknown actions
  }
}

/**
 * Type guard to check if a string is a valid Language.
 * @param lang - The string to validate.
 * @returns True if the string is a supported language.
 */
function isValidLanguage(lang: string): lang is Language {
  return lang === "de" || lang === "en" || lang === "tr"; // Check against supported languages
}

/**
 * Detects the initial language from localStorage or browser settings.
 * @returns The detected or default language.
 */
function detectInitialLanguage(): Language {
  const stored = readFromStorage<Language>(LOCAL_STORAGE_KEY); // Try localStorage first
  if (stored && isValidLanguage(stored)) {
    return stored; // Return stored language if valid
  }

  const browserLang = navigator.language.split("-")[0].toLowerCase(); // Get browser language prefix
  if (isValidLanguage(browserLang)) {
    return browserLang; // Return browser language if supported
  }

  return "de"; // Default fallback to German
}

/** Props interface for the LanguageProvider component. */
interface LanguageProviderProps {
  children: ReactNode; // Child components to wrap
}

/**
 * Provides language state and setter to the component tree.
 * Persists language preference to localStorage on every change.
 * @param props - Component props containing children.
 * @returns The provider-wrapped children.
 */
export function LanguageProvider({
  children,
}: LanguageProviderProps): ReactNode {
  const [state, dispatch] = useReducer(languageReducer, {
    language: detectInitialLanguage(), // Initialize with detected language
  });

  useEffect(() => {
    writeToStorage(LOCAL_STORAGE_KEY, state.language); // Persist language to localStorage
    document.documentElement.lang = state.language; // Update HTML lang attribute for a11y
  }, [state.language]); // Run when language changes

  /** Sets the application language. */
  const setLanguage = (lang: Language): void => {
    dispatch({ type: "SET_LANGUAGE", payload: lang }); // Dispatch language change action
  };

  /** Context value object. */
  const value: LanguageContextValue = {
    language: state.language, // Current language
    setLanguage, // Language setter function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children} {/* Render children within provider */}
    </LanguageContext.Provider>
  );
}
