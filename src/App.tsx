/**
 * App component.
 * Root layout shell with semantic HTML landmarks,
 * ErrorBoundary wrapper, AppProviders for global state,
 * and main Dashboard view.
 */

import type { ReactNode } from "react"; // ReactNode type
import { useTranslation } from "./hooks/useTranslation"; // Translation hook
import { ErrorBoundary } from "./core/ErrorBoundary"; // Global error boundary
import { AppProviders } from "./core/providers/AppProviders"; // Context providers wrapper
import { ErrorMessage } from "./ui/ErrorMessage"; // Error display component
import { Dashboard } from "./ui/Dashboard"; // Main dashboard view
import { LanguageSwitcher } from "./ui/LanguageSwitcher"; // Language toggle
import { ThemeSwitcher } from "./ui/ThemeSwitcher"; // Theme toggle

/**
 * Inner app content that uses hooks (must be inside providers).
 * Separated because hooks require provider context.
 * @returns The app layout with header, main, and footer.
 */
function AppContent(): ReactNode {
  const { t } = useTranslation(); // Get translation function

  return (
    <div className="app">
      {" "}
      {/* Layout shell from global.css */}
      {/* Skip link as first focusable element for a11y */}
      <a href="#main-content" className="skip-link">
        {t("a11y.skipToContent")}
      </a>
      {/* App header landmark — uses global .app__header styles */}
      <header className="app__header">
        <h1>{t("app.title")}</h1> {/* App name */}
        <div className="app__header-actions">
          {" "}
          {/* Header action buttons */}
          <ThemeSwitcher /> {/* Dark/light mode toggle */}
          <LanguageSwitcher /> {/* Language toggle */}
        </div>
      </header>
      {/* Main content landmark — uses global .app__main styles */}
      <main id="main-content" className="app__main">
        <Dashboard /> {/* Main dashboard view */}
      </main>
      {/* App footer — uses global .app__footer styles */}
      <footer className="app__footer">
        <p>{t("app.footer")}</p> {/* Footer text */}
      </footer>
      {/* Screen reader announcements region */}
      <div aria-live="polite" className="sr-only" />
    </div>
  );
}

/**
 * Root application component.
 * Wraps everything in ErrorBoundary and AppProviders.
 * ErrorBoundary fallback uses static strings because
 * translation hook is not available outside providers.
 * @returns The complete application.
 */
export function App(): ReactNode {
  return (
    <ErrorBoundary
      fallback={(errorKey, reset) => (
        <ErrorMessage
          title="Fuel-Watch" // Static fallback — no i18n outside providers
          message={errorKey} // Error key as message
          actionLabel="Retry" // Static fallback button
          onAction={reset} // Reset error state
        />
      )}
    >
      <AppProviders>
        <AppContent /> {/* App content inside providers */}
      </AppProviders>
    </ErrorBoundary>
  );
}
