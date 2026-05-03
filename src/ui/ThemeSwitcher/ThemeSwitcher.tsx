/**
 * ThemeSwitcher component.
 * Toggles between light and dark theme.
 * Persists preference to localStorage and updates data-theme attribute.
 */

import { useState, useEffect, useCallback, type ReactNode } from "react"; // React hooks and types
import { readFromStorage, writeToStorage } from "../../utils/storage"; // Storage helpers
import "./ThemeSwitcher.css"; // Co-located styles

/** Supported theme values. */
type Theme = "light" | "dark";

/** LocalStorage key for theme preference. */
const STORAGE_KEY = "fuel-watch-theme";

/**
 * Detects initial theme from localStorage or system preference.
 * @returns The detected or default theme.
 */
function detectInitialTheme(): Theme {
  const stored = readFromStorage<Theme>(STORAGE_KEY); // Check localStorage
  if (stored === "light" || stored === "dark") return stored; // Use stored preference

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches; // Check system preference
  return prefersDark ? "dark" : "light"; // Follow system
}

/**
 * Renders a theme toggle button.
 * Applies data-theme attribute on <html> element.
 * @returns The theme switcher button.
 */
export function ThemeSwitcher(): ReactNode {
  const [theme, setTheme] = useState<Theme>(detectInitialTheme); // Initialize theme

  /** Apply theme to DOM and persist. */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // Set data-theme on <html>
    writeToStorage(STORAGE_KEY, theme); // Persist to localStorage
  }, [theme]); // Run when theme changes

  /** Toggle between light and dark. */
  const toggleTheme = useCallback((): void => {
    setTheme((prev) => (prev === "light" ? "dark" : "light")); // Flip theme
  }, []);

  return (
    <button
      className="theme-switcher" // BEM block
      type="button" // Explicit button type
      onClick={toggleTheme} // Toggle handler
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      } // Accessible label
    >
      <span className="theme-switcher__icon" aria-hidden="true">
        {theme === "light" ? "🌙" : "☀️"} {/* Moon for light, sun for dark */}
      </span>
    </button>
  );
}
