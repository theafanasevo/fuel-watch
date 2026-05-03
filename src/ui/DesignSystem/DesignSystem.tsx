import { useState } from "react";
import {
  Search,
  MapPin,
  Fuel,
  Heart,
  Clock,
  TrendingDown,
  TrendingUp,
  Sun,
  Moon,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  Navigation,
  Filter,
  Bell,
  Download,
  Globe,
  Info,
} from "lucide-react";
import "./DesignSystem.css";

/** Design System showcase page for Fuel-Watch */
export function DesignSystem() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () =>
      (document.documentElement.getAttribute("data-theme") as
        | "light"
        | "dark") || "light",
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="ds">
      {/* ── Header ── */}
      <header className="ds__header">
        <div>
          <h1 className="ds__title">Fuel-Watch Design System</h1>
          <p className="ds__subtitle">
            Visual reference for all design tokens, components, and patterns.
          </p>
        </div>
        <button
          className="ds__theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </header>

      {/* ── Colors ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Colors</h2>

        <h3 className="ds__group-title">Brand</h3>
        <div className="ds__color-grid">
          <ColorSwatch name="Primary" var="--color-primary" />
          <ColorSwatch name="Primary Hover" var="--color-primary-hover" />
          <ColorSwatch name="Primary Light" var="--color-primary-light" />
        </div>

        <h3 className="ds__group-title">Semantic</h3>
        <div className="ds__color-grid">
          <ColorSwatch name="Success" var="--color-success" />
          <ColorSwatch name="Success Light" var="--color-success-light" />
          <ColorSwatch name="Warning" var="--color-warning" />
          <ColorSwatch name="Warning Light" var="--color-warning-light" />
          <ColorSwatch name="Danger" var="--color-danger" />
          <ColorSwatch name="Danger Light" var="--color-danger-light" />
        </div>

        <h3 className="ds__group-title">Surface</h3>
        <div className="ds__color-grid">
          <ColorSwatch name="Background" var="--color-bg" />
          <ColorSwatch name="Surface" var="--color-surface" />
          <ColorSwatch name="Surface Hover" var="--color-surface-hover" />
          <ColorSwatch name="Elevated" var="--color-surface-elevated" />
        </div>

        <h3 className="ds__group-title">Text</h3>
        <div className="ds__color-grid">
          <ColorSwatch name="Text" var="--color-text" />
          <ColorSwatch name="Secondary" var="--color-text-secondary" />
          <ColorSwatch name="Muted" var="--color-text-muted" />
          <ColorSwatch name="Inverse" var="--color-text-inverse" />
        </div>

        <h3 className="ds__group-title">Fuel Types</h3>
        <div className="ds__color-grid">
          <ColorSwatch name="E5" var="--fuel-e5-color" />
          <ColorSwatch name="E10" var="--fuel-e10-color" />
          <ColorSwatch name="Diesel" var="--fuel-diesel-color" />
        </div>
      </section>

      {/* ── Typography ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Typography</h2>
        <div className="ds__type-scale">
          <div className="ds__type-row">
            <span className="ds__type-label">3xl / 40px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-3xl)" }}
            >
              Fuel Watch Germany
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">2xl / 32px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-2xl)" }}
            >
              Real-time fuel prices
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">xl / 24px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-xl)" }}
            >
              Nearby Stations
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">lg / 20px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-lg)" }}
            >
              Price Score Analysis
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">base / 16px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-base)" }}
            >
              Body text for descriptions and content
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">sm / 14px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              Secondary information and metadata
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">xs / 12px</span>
            <span
              className="ds__type-sample"
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              Captions, timestamps, fine print
            </span>
          </div>
        </div>

        <h3 className="ds__group-title">Price Display (Tabular Nums)</h3>
        <div className="ds__price-demo">
          <span className="ds__price">1,459 €/L</span>
          <span className="ds__price">1,789 €/L</span>
          <span className="ds__price">1,239 €/L</span>
          <span className="ds__price">2,019 €/L</span>
        </div>

        <h3 className="ds__group-title">Font Weights</h3>
        <div className="ds__type-scale">
          <div className="ds__type-row">
            <span className="ds__type-label">Normal 400</span>
            <span className="ds__type-sample" style={{ fontWeight: 400 }}>
              The quick brown fox jumps
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">Medium 500</span>
            <span className="ds__type-sample" style={{ fontWeight: 500 }}>
              The quick brown fox jumps
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">Semi 600</span>
            <span className="ds__type-sample" style={{ fontWeight: 600 }}>
              The quick brown fox jumps
            </span>
          </div>
          <div className="ds__type-row">
            <span className="ds__type-label">Bold 700</span>
            <span className="ds__type-sample" style={{ fontWeight: 700 }}>
              The quick brown fox jumps
            </span>
          </div>
        </div>
      </section>

      {/* ── Spacing ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Spacing</h2>
        <div className="ds__spacing-scale">
          {[
            { name: "2xs", val: "2px" },
            { name: "xs", val: "4px" },
            { name: "sm", val: "8px" },
            { name: "md", val: "16px" },
            { name: "lg", val: "24px" },
            { name: "xl", val: "32px" },
            { name: "2xl", val: "48px" },
            { name: "3xl", val: "64px" },
          ].map((s) => (
            <div className="ds__spacing-row" key={s.name}>
              <span className="ds__spacing-label">
                {s.name} / {s.val}
              </span>
              <div
                className="ds__spacing-bar"
                style={{ width: `var(--space-${s.name})` }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Shadows ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Shadows</h2>
        <div className="ds__shadow-grid">
          {["sm", "md", "lg", "xl"].map((s) => (
            <div
              className="ds__shadow-box"
              key={s}
              style={{ boxShadow: `var(--shadow-${s})` }}
            >
              shadow-{s}
            </div>
          ))}
          <div
            className="ds__shadow-box"
            style={{ boxShadow: "var(--shadow-focus)" }}
          >
            shadow-focus
          </div>
          <div
            className="ds__shadow-box"
            style={{ boxShadow: "var(--shadow-inner)" }}
          >
            shadow-inner
          </div>
        </div>
      </section>

      {/* ── Radius ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Border Radius</h2>
        <div className="ds__radius-grid">
          {["sm", "md", "lg", "xl", "full"].map((r) => (
            <div className="ds__radius-item" key={r}>
              <div
                className="ds__radius-box"
                style={{ borderRadius: `var(--radius-${r})` }}
              />
              <span className="ds__radius-label">radius-{r}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Buttons ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Buttons</h2>

        <h3 className="ds__group-title">Primary</h3>
        <div className="ds__button-row">
          <button className="ds-btn ds-btn--primary ds-btn--sm">Small</button>
          <button className="ds-btn ds-btn--primary ds-btn--md">
            <Search size={18} aria-hidden="true" /> Search
          </button>
          <button className="ds-btn ds-btn--primary ds-btn--lg">
            <Navigation size={20} aria-hidden="true" /> Find Stations
          </button>
          <button className="ds-btn ds-btn--primary ds-btn--md" disabled>
            Disabled
          </button>
        </div>

        <h3 className="ds__group-title">Secondary</h3>
        <div className="ds__button-row">
          <button className="ds-btn ds-btn--secondary ds-btn--sm">Small</button>
          <button className="ds-btn ds-btn--secondary ds-btn--md">
            <Filter size={18} aria-hidden="true" /> Filter
          </button>
          <button className="ds-btn ds-btn--secondary ds-btn--lg">
            <Globe size={18} aria-hidden="true" /> Deutsch
          </button>
          <button className="ds-btn ds-btn--secondary ds-btn--md" disabled>
            Disabled
          </button>
        </div>

        <h3 className="ds__group-title">Ghost</h3>
        <div className="ds__button-row">
          <button className="ds-btn ds-btn--ghost ds-btn--sm">Small</button>
          <button className="ds-btn ds-btn--ghost ds-btn--md">
            <Heart size={18} aria-hidden="true" /> Favorite
          </button>
          <button className="ds-btn ds-btn--ghost ds-btn--md" disabled>
            Disabled
          </button>
        </div>

        <h3 className="ds__group-title">Danger</h3>
        <div className="ds__button-row">
          <button className="ds-btn ds-btn--danger ds-btn--md">
            <XCircle size={18} aria-hidden="true" /> Clear All
          </button>
        </div>
      </section>

      {/* ── Inputs ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Form Inputs</h2>
        <div className="ds__input-grid">
          <div className="ds__input-group">
            <label className="ds__input-label">Search Location</label>
            <div className="ds-input-wrapper">
              <Search size={18} className="ds-input-icon" aria-hidden="true" />
              <input
                type="text"
                className="ds-input ds-input--with-icon"
                placeholder="Berlin, 10115, or address..."
              />
            </div>
          </div>

          <div className="ds__input-group">
            <label className="ds__input-label">Default Input</label>
            <input
              type="text"
              className="ds-input"
              placeholder="Type something..."
            />
          </div>

          <div className="ds__input-group">
            <label className="ds__input-label">Disabled</label>
            <input
              type="text"
              className="ds-input"
              placeholder="Cannot edit"
              disabled
            />
          </div>

          <div className="ds__input-group">
            <label className="ds__input-label">Select</label>
            <select className="ds-select">
              <option>Super E5</option>
              <option>Super E10</option>
              <option>Diesel</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── Score Badges ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Score Badges</h2>
        <div className="ds__badge-row">
          <span className="ds-badge ds-badge--great">
            <CheckCircle size={14} aria-hidden="true" />
            92 — Great Deal
          </span>
          <span className="ds-badge ds-badge--fair">
            <Info size={14} aria-hidden="true" />
            65 — Fair Price
          </span>
          <span className="ds-badge ds-badge--expensive">
            <AlertTriangle size={14} aria-hidden="true" />
            23 — Expensive
          </span>
        </div>
      </section>

      {/* ── Time Window Badges ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Time Window Badges</h2>
        <div className="ds__badge-row">
          <span className="ds-time-badge ds-time-badge--golden">
            <Star size={14} aria-hidden="true" />
            Golden Hour (21:00–22:00)
          </span>
          <span className="ds-time-badge ds-time-badge--evening">
            <TrendingDown size={14} aria-hidden="true" />
            Evening Window (16:00–22:00)
          </span>
          <span className="ds-time-badge ds-time-badge--morning">
            <TrendingUp size={14} aria-hidden="true" />
            Morning Peak (05:00–07:00)
          </span>
        </div>
      </section>

      {/* ── Reform Badges ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Price Reform Badges</h2>
        <div className="ds__badge-row">
          <span className="ds-reform-badge ds-reform-badge--safe">
            <CheckCircle size={14} aria-hidden="true" />
            Daily increase used — price can only drop
          </span>
          <span className="ds-reform-badge ds-reform-badge--risk">
            <AlertTriangle size={14} aria-hidden="true" />
            Increase not yet used — price may rise
          </span>
        </div>
      </section>

      {/* ── Recommendation Cards ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Recommendation Cards</h2>
        <div className="ds__rec-grid">
          <div className="ds-rec ds-rec--refuel">
            <div className="ds-rec__icon">
              <CheckCircle size={32} aria-hidden="true" />
            </div>
            <div className="ds-rec__content">
              <h3 className="ds-rec__title">Refuel Now</h3>
              <p className="ds-rec__desc">
                Golden Hour active. Sunday is one of the cheapest days.
              </p>
              <p className="ds-rec__savings">
                Est. savings: ~15 ct/L → 7.50 € per 50L tank
              </p>
            </div>
          </div>

          <div className="ds-rec ds-rec--wait">
            <div className="ds-rec__icon">
              <Clock size={32} aria-hidden="true" />
            </div>
            <div className="ds-rec__content">
              <h3 className="ds-rec__title">Wait If Possible</h3>
              <p className="ds-rec__desc">
                Morning peak hour. Prices will likely drop later today.
              </p>
              <p className="ds-rec__savings">
                Best time: ~21:00 → save ~12 ct/L
              </p>
            </div>
          </div>

          <div className="ds-rec ds-rec--neutral">
            <div className="ds-rec__icon">
              <Info size={32} aria-hidden="true" />
            </div>
            <div className="ds-rec__content">
              <h3 className="ds-rec__title">Normal Conditions</h3>
              <p className="ds-rec__desc">
                Prices are near the daily average. No strong signal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Station Card Preview ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Station Card Preview</h2>
        <div className="ds__card-grid">
          <article
            className="ds-station"
            aria-label="Aral Berlin Mitte, E5 price 1.729 Euro"
          >
            <div className="ds-station__header">
              <div>
                <h3 className="ds-station__name">Aral Berlin Mitte</h3>
                <p className="ds-station__address">
                  <MapPin size={14} aria-hidden="true" />
                  Friedrichstraße 123 — 2.3 km
                </p>
              </div>
              <button
                className="ds-station__fav ds-station__fav--active"
                aria-label="Remove from favorites"
              >
                <Heart size={20} fill="currentColor" aria-hidden="true" />
              </button>
            </div>
            <div className="ds-station__body">
              <div className="ds-station__price-block">
                <span className="ds-station__fuel-label">E5</span>
                <span className="ds-station__price ds-station__price--cheap">
                  1,729 €
                </span>
              </div>
              <span className="ds-badge ds-badge--great">
                <CheckCircle size={14} aria-hidden="true" /> 92
              </span>
            </div>
            <div className="ds-station__footer">
              <span className="ds-reform-badge ds-reform-badge--safe">
                <CheckCircle size={12} aria-hidden="true" /> Increase used
              </span>
              <span className="ds-station__status ds-station__status--open">
                <span className="ds-station__dot" /> Open
              </span>
              <span className="ds-station__updated">
                <Clock size={12} aria-hidden="true" /> 3 min ago
              </span>
            </div>
          </article>

          <article
            className="ds-station"
            aria-label="Shell Alexanderplatz, E5 price 1.859 Euro"
          >
            <div className="ds-station__header">
              <div>
                <h3 className="ds-station__name">Shell Alexanderplatz</h3>
                <p className="ds-station__address">
                  <MapPin size={14} aria-hidden="true" />
                  Alexanderplatz 5 — 4.1 km
                </p>
              </div>
              <button className="ds-station__fav" aria-label="Add to favorites">
                <Heart size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="ds-station__body">
              <div className="ds-station__price-block">
                <span className="ds-station__fuel-label">E5</span>
                <span className="ds-station__price ds-station__price--peak">
                  1,859 €
                </span>
              </div>
              <span className="ds-badge ds-badge--expensive">
                <AlertTriangle size={14} aria-hidden="true" /> 31
              </span>
            </div>
            <div className="ds-station__footer">
              <span className="ds-reform-badge ds-reform-badge--risk">
                <AlertTriangle size={12} aria-hidden="true" /> May rise
              </span>
              <span className="ds-station__status ds-station__status--open">
                <span className="ds-station__dot" /> Open
              </span>
              <span className="ds-station__updated">
                <Clock size={12} aria-hidden="true" /> 1 min ago
              </span>
            </div>
          </article>
        </div>
      </section>

      {/* ── Skeleton Loading ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Loading Skeleton</h2>
        <div className="ds__card-grid">
          <div className="ds-station ds-station--skeleton">
            <div className="ds-station__header">
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton--text skeleton--w60" />
                <div className="skeleton skeleton--text skeleton--w40" />
              </div>
            </div>
            <div className="ds-station__body">
              <div className="skeleton skeleton--price" />
              <div className="skeleton skeleton--badge" />
            </div>
            <div className="ds-station__footer">
              <div className="skeleton skeleton--text skeleton--w30" />
              <div className="skeleton skeleton--text skeleton--w20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Icons ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Icons (Lucide)</h2>
        <div className="ds__icon-grid">
          {[
            { icon: <Search size={24} />, name: "Search" },
            { icon: <MapPin size={24} />, name: "MapPin" },
            { icon: <Fuel size={24} />, name: "Fuel" },
            { icon: <Heart size={24} />, name: "Heart" },
            { icon: <Clock size={24} />, name: "Clock" },
            { icon: <Star size={24} />, name: "Star" },
            { icon: <TrendingDown size={24} />, name: "TrendingDown" },
            { icon: <TrendingUp size={24} />, name: "TrendingUp" },
            { icon: <Sun size={24} />, name: "Sun" },
            { icon: <Moon size={24} />, name: "Moon" },
            { icon: <Navigation size={24} />, name: "Navigation" },
            { icon: <Filter size={24} />, name: "Filter" },
            { icon: <Bell size={24} />, name: "Bell" },
            { icon: <Download size={24} />, name: "Download" },
            { icon: <Globe size={24} />, name: "Globe" },
            { icon: <ChevronRight size={24} />, name: "ChevronRight" },
            { icon: <CheckCircle size={24} />, name: "CheckCircle" },
            { icon: <AlertTriangle size={24} />, name: "AlertTriangle" },
            { icon: <XCircle size={24} />, name: "XCircle" },
            { icon: <Info size={24} />, name: "Info" },
          ].map((i) => (
            <div className="ds__icon-item" key={i.name}>
              {i.icon}
              <span className="ds__icon-name">{i.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trend Chart Preview ── */}
      <section className="ds__section">
        <h2 className="ds__section-title">Weekly Trend Chart</h2>
        <div className="ds__trend-chart">
          {[
            { day: "Mon", offset: -3, cheapest: true },
            { day: "Tue", offset: -1, cheapest: false },
            { day: "Wed", offset: 1, cheapest: false },
            { day: "Thu", offset: 2, cheapest: false },
            { day: "Fri", offset: 3, cheapest: false },
            { day: "Sat", offset: 1, cheapest: false },
            { day: "Sun", offset: -3, cheapest: true },
          ].map((d) => (
            <div className="ds__trend-bar-group" key={d.day}>
              <span className="ds__trend-value">
                {d.offset > 0 ? "+" : ""}
                {d.offset}ct
              </span>
              <div
                className={`ds__trend-bar ${
                  d.cheapest
                    ? "ds__trend-bar--cheapest"
                    : d.offset === 3
                      ? "ds__trend-bar--expensive"
                      : ""
                }`}
                style={{
                  height: `${Math.abs(d.offset) * 20 + 20}px`,
                }}
              />
              <span className="ds__trend-day">{d.day}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Helper Component ── */
interface ColorSwatchProps {
  name: string;
  var: string;
}

function ColorSwatch({ name, var: cssVar }: ColorSwatchProps) {
  return (
    <div className="ds__color-swatch">
      <div
        className="ds__color-preview"
        style={{ backgroundColor: `var(${cssVar})` }}
      />
      <span className="ds__color-name">{name}</span>
      <code className="ds__color-var">{cssVar}</code>
    </div>
  );
}
