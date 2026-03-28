import React, { useState } from "react"; // React and hooks
import { useTranslation } from "./hooks/useTranslation"; // custom i18n hook

export function App(): JSX.Element {
  const { t, lang, toggleLanguage } = useTranslation(); // translator, current language and toggler

  // The translation hook returns top-level groups (app, search, etc).
  // Cast to any for convenient nested access in the UI.
  const app = t("app") as any;
  const search = t("search") as any;
  const a11y = (t("a11y") || {}) as any;

  const [query, setQuery] = useState("");

  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        color: "var(--text-color)",
        minHeight: "100vh",
        padding: "var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <header>
        <h1>{app?.title ?? "Fuel Watch"}</h1>
        <p>{app?.subtitle ?? "Real-time fuel prices across Germany"}</p>
      </header>

      <section aria-labelledby="search-heading">
        <h2 id="search-heading" className="sr-only">
          {a11y?.searchInput ?? "Search"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Demonstration only: show the query in the console
            // Real behavior: would trigger geocode/search hook
            // eslint-disable-next-line no-console
            console.log("Search query:", query);
          }}
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            alignItems: "center",
          }}
        >
          <label htmlFor="q" className="sr-only">
            {a11y?.searchInput ?? "Search input"}
          </label>
          <input
            id="q"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              search?.placeholder ?? "Search city, PLZ or address..."
            }
            aria-label={a11y?.searchInput ?? "Search"}
            style={{ padding: "var(--space-sm)", flex: 1 }}
          />
          <button type="submit" aria-label={search?.button ?? "Search"}>
            {search?.button ?? "Search"}
          </button>
        </form>
      </section>

      <aside>
        <p>
          {app?.footer ?? ""}{" "}
          {/* show small footer/credits from translations if present */}
        </p>
      </aside>

      <footer
        style={{
          marginTop: "auto",
          display: "flex",
          gap: "var(--space-sm)",
          alignItems: "center",
        }}
      >
        <div>
          <strong>{lang.toUpperCase()}</strong>
        </div>
        <button
          onClick={toggleLanguage}
          aria-label={a11y?.languageSwitch?.replace(
            "{{lang}}",
            lang === "de" ? "Deutsch" : "English",
          )}
        >
          {lang === "de" ? "Deutsch" : "English"}
        </button>
      </footer>
    </div>
  );
}
