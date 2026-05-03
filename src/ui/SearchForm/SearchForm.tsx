/**
 * SearchForm component.
 * Provides location search with autocomplete, fuel type selection,
 * radius picker, and search submission.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type FormEvent,
} from "react"; // React hooks and types
import type { Coordinates } from "../../types/geo"; // Coordinates type
import type { FuelType } from "../../types/fuel"; // FuelType type
import type { PhotonResult } from "../../types/geo"; // Photon result type
import { useGeocode } from "../../hooks/useGeocode"; // Geocoding hook
import { useTranslation } from "../../hooks/useTranslation"; // Translation hook
import { FuelTypeSelector } from "../FuelTypeSelector"; // Fuel toggle component
import { Spinner } from "../Spinner"; // Loading indicator
import "./SearchForm.css"; // Co-located styles

/** Radius options in kilometers. */
const RADIUS_OPTIONS: readonly number[] = [5, 10, 25] as const;

/** Default radius in km. */
const DEFAULT_RADIUS = 5;

/** Default fuel type. */
const DEFAULT_FUEL: FuelType = "e5";

/** Props interface for the SearchForm component. */
interface SearchFormProps {
  /** Callback fired when the user submits a valid search. */
  onSearch: (params: {
    coordinates: Coordinates;
    fuelType: FuelType;
    radius: number;
  }) => void;
}

/**
 * Renders the main search form with location autocomplete,
 * fuel type toggle, radius selector, and submit button.
 * @param props - Search submission handler.
 * @returns The search form element.
 */
export function SearchForm({ onSearch }: SearchFormProps): ReactNode {
  const { t } = useTranslation(); // Get translation function
  const { results, loading, error, searchLocation } = useGeocode(); // Geocoding hook

  const [query, setQuery] = useState(""); // Location input value
  const [fuelType, setFuelType] = useState<FuelType>(DEFAULT_FUEL); // Selected fuel type
  const [radius, setRadius] = useState<number>(DEFAULT_RADIUS); // Selected radius
  const [selectedCoords, setSelectedCoords] = useState<Coordinates | null>(
    null,
  ); // Chosen location
  const [showSuggestions, setShowSuggestions] = useState(false); // Suggestions dropdown visibility
  const [selectedName, setSelectedName] = useState(""); // Display name of selected location

  const formRef = useRef<HTMLFormElement>(null); // Form element ref
  const suggestionsRef = useRef<HTMLUListElement>(null); // Suggestions list ref

  /**
   * Handles input change and triggers geocoding search.
   * useGeocode already handles debouncing internally.
   */
  const handleInputChange = useCallback(
    (value: string): void => {
      setQuery(value); // Update input value
      setSelectedCoords(null); // Clear previous selection
      setSelectedName(""); // Clear selected name

      if (value.trim().length >= 2) {
        searchLocation(value.trim()); // Trigger geocoding search
        setShowSuggestions(true); // Show suggestions dropdown
      } else {
        setShowSuggestions(false); // Hide suggestions for short input
      }
    },
    [searchLocation],
  );

  /**
   * Handles selection of a suggestion from the dropdown.
   * Uses PhotonResult's flat coordinates structure.
   */
  const handleSelectSuggestion = useCallback((result: PhotonResult): void => {
    const coords: Coordinates = {
      lat: result.coordinates.lat, // Latitude from PhotonResult
      lon: result.coordinates.lon, // Longitude from PhotonResult
    };

    setSelectedCoords(coords); // Store selected coordinates
    setSelectedName(result.name); // Store display name
    setQuery(result.name); // Update input with selected name
    setShowSuggestions(false); // Hide suggestions
  }, []);

  /**
   * Handles form submission.
   * Only submits if coordinates are selected.
   */
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>): void => {
      e.preventDefault(); // Prevent default form submission

      if (!selectedCoords) return; // Guard: no coordinates selected

      onSearch({
        coordinates: selectedCoords, // Selected location
        fuelType, // Selected fuel type
        radius, // Selected radius in km
      });
    },
    [selectedCoords, fuelType, radius, onSearch],
  );

  /**
   * Closes suggestions when clicking outside the form.
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setShowSuggestions(false); // Hide suggestions on outside click
      }
    };

    document.addEventListener("mousedown", handleClickOutside); // Listen for outside clicks
    return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener
  }, []);

  /** Whether the submit button should be disabled. */
  const isSubmitDisabled = !selectedCoords; // Disable if no location selected

  return (
    <form
      className="search-form fade-in" // BEM block + entrance animation
      ref={formRef} // Form ref for outside click detection
      onSubmit={handleSubmit} // Form submission handler
      role="search" // Search landmark role
      aria-label={t("a11y.searchInput")} // Accessible form label
    >
      {/* ── Location Input ── */}
      <div className="search-form__field">
        <label
          className="search-form__label" // BEM element
          htmlFor="location-input" // Associate with input
        >
          {t("search.locationLabel")}
        </label>

        <div className="search-form__input-wrapper">
          <input
            id="location-input" // Input ID for label association
            className="search-form__input" // BEM element
            type="text" // Text input
            value={query} // Controlled input value
            onChange={(e) => handleInputChange(e.target.value)} // Input change handler
            placeholder={t("search.placeholder")} // Placeholder text
            autoComplete="off" // Disable browser autocomplete
            aria-expanded={showSuggestions && results.length > 0} // Combobox expanded state
            aria-controls="location-suggestions" // Controls suggestions list
            aria-autocomplete="list" // Autocomplete type
            role="combobox" // Combobox role for a11y
          />
          {loading && (
            <div className="search-form__input-spinner">
              <Spinner size="sm" /> {/* Small spinner inside input */}
            </div>
          )}
        </div>

        {/* ── Suggestions Dropdown ── */}
        {showSuggestions && results.length > 0 && (
          <ul
            id="location-suggestions" // ID for aria-controls
            className="search-form__suggestions" // BEM element
            ref={suggestionsRef} // Suggestions list ref
            role="listbox" // Listbox role for suggestions
            aria-label={t("a11y.searchInput")} // Accessible label
          >
            {results.map((result) => (
              <li
                key={result.id} // Unique ID from PhotonResult
                className="search-form__suggestion" // BEM element
                role="option" // Option role for listbox
                aria-selected={false} // Selection state
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur before selection
                  handleSelectSuggestion(result); // Handle selection
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault(); // Prevent default scroll on space
                    handleSelectSuggestion(result); // Keyboard selection
                  }
                }}
                tabIndex={0} // Make focusable
              >
                {result.name} {/* Display name from PhotonResult */}
              </li>
            ))}
          </ul>
        )}

        {/* ── Geocoding Error ── */}
        {error && (
          <p className="search-form__error" role="alert">
            {t(`errors.${error}`)} {/* Translated error message */}
          </p>
        )}

        {/* ── Selected Location Badge ── */}
        {selectedName && (
          <p className="search-form__selected" aria-live="polite">
            📍 {selectedName} {/* Show confirmed location */}
          </p>
        )}
      </div>

      {/* ── Fuel Type ── */}
      <div className="search-form__field">
        <FuelTypeSelector
          value={fuelType} // Current fuel type
          onChange={setFuelType} // Fuel type change handler
        />
      </div>

      {/* ── Radius Selector ── */}
      <div className="search-form__field">
        <label
          className="search-form__label" // BEM element
          htmlFor="radius-select" // Associate with select
        >
          {t("search.radiusLabel")}
        </label>
        <select
          id="radius-select" // Select ID for label
          className="search-form__select" // BEM element
          value={radius} // Controlled select value
          onChange={(e) => setRadius(Number(e.target.value))} // Radius change handler
        >
          {RADIUS_OPTIONS.map((km) => (
            <option key={km} value={km}>
              {t("search.radiusKm", { radius: String(km) })}{" "}
              {/* Translated radius */}
            </option>
          ))}
        </select>
      </div>

      {/* ── Submit Button ── */}
      <button
        className="search-form__submit" // BEM element
        type="submit" // Form submission
        disabled={isSubmitDisabled} // Disable without coordinates
        aria-disabled={isSubmitDisabled} // Accessible disabled state
      >
        {t("search.button")} {/* Translated button text */}
      </button>
    </form>
  );
}
