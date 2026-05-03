/**
 * useTranslation hook.
 * Provides type-safe i18n with dot-notation key access
 * and {{param}} interpolation support.
 * Consumes LanguageContext for current language state.
 */

import { useCallback } from "react"; // React memoization hook
import type { Language } from "../store/LanguageContext"; // Language type
import { useLanguage } from "./useLanguage"; // Language context hook
import de from "../locales/de.json"; // German translations (base)
import en from "../locales/en.json"; // English translations
import tr from "../locales/tr.json"; // Turkish translations

/** Base translation structure derived from German JSON. */
type TranslationTree = typeof de;

/** Map of all translation dictionaries keyed by language code. */
const translations: Record<Language, TranslationTree> = {
  de, // German dictionary (base)
  en: en as unknown as TranslationTree, // English dictionary cast to base shape
  tr: tr as unknown as TranslationTree, // Turkish dictionary cast to base shape
};

/** Return type for useTranslation hook. */
interface UseTranslationResult {
  /** Translate a dot-notation key, with optional interpolation values. */
  t: (key: string, params?: Record<string, string>) => string;
  /** Current active language. */
  language: Language;
  /** Set language to a specific code. */
  setLanguage: (lang: Language) => void;
}

/**
 * Resolves a dot-notation key against a nested object.
 * Example: resolve("search.button", tree) → "Suchen"
 * @param key - Dot-notation path like "search.button".
 * @param tree - Nested translation object.
 * @returns The resolved string, or the key itself if not found.
 */
function resolve(key: string, tree: TranslationTree): string {
  const parts = key.split("."); // Split dot-notation into segments
  let current: unknown = tree; // Start at tree root

  for (const part of parts) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== "object"
    ) {
      return key; // Path broken, return key as fallback
    }
    current = (current as Record<string, unknown>)[part]; // Traverse one level deeper
  }

  if (typeof current === "string") {
    return current; // Found a string leaf, return it
  }

  return key; // Not a string leaf, return key as fallback
}

/**
 * Provides translation function and language controls.
 * Uses LanguageContext as single source of truth for current language.
 * Supports dot-notation keys: t("search.button")
 * Supports interpolation: t("station.distance", { distance: "2.3" })
 * @returns Translation function, current language, and setter.
 */
export function useTranslation(): UseTranslationResult {
  const { language, setLanguage } = useLanguage(); // Get language from context

  /**
   * Translates a dot-notation key with optional parameter interpolation.
   * Falls back to the key string if translation is missing.
   * @param key - Dot-notation translation key like "search.button".
   * @param params - Optional interpolation values for {{placeholder}} patterns.
   * @returns Translated string.
   */
  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const dict = translations[language]; // Get current language dictionary
      let value = resolve(key, dict); // Resolve dot-notation key

      /* Replace {{placeholder}} patterns with param values */
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value.replace(
            new RegExp(`\\{\\{${paramKey}\\}\\}`, "g"), // Match {{key}} pattern
            paramValue, // Replace with value
          );
        });
      }

      return value; // Return translated string
    },
    [language], // Re-create when language changes
  );

  return { t, language, setLanguage }; // Return hook API
}
