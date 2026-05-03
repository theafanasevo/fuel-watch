/**
 * LanguageSwitcher component.
 * Renders a toggle group for switching between supported languages.
 * Consumes useLanguage hook for current language and setter.
 */

import type { ReactNode } from "react"; // ReactNode type
import type { Language } from "../../store/LanguageContext"; // Language type
import { useLanguage } from "../../hooks/useLanguage"; // Language hook
import "./LanguageSwitcher.css"; // Co-located styles

/** Available language options with display labels. */
const LANGUAGE_OPTIONS: readonly { code: Language; label: string }[] = [
  { code: "de", label: "DE" }, // German option
  { code: "en", label: "EN" }, // English option
  { code: "tr", label: "TR" }, // Turkish option
] as const;

/**
 * Renders a language toggle group.
 * Highlights the currently active language.
 * @returns The language switcher element.
 */
export function LanguageSwitcher(): ReactNode {
  const { language, setLanguage } = useLanguage(); // Get current language and setter

  return (
    <nav
      className="language-switcher" // BEM block
      aria-label="Language selection" // Accessible label for nav landmark
    >
      {LANGUAGE_OPTIONS.map(({ code, label }) => (
        <button
          key={code} // Unique key per language
          type="button" // Explicit button type
          className={`language-switcher__button ${
            language === code ? "language-switcher__button--active" : "" // Active modifier
          }`}
          aria-pressed={language === code} // Toggle state for assistive tech
          onClick={() => setLanguage(code)} // Update language on click
        >
          {label} {/* Display language code */}
        </button>
      ))}
    </nav>
  );
}
