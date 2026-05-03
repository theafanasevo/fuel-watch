/**
 * FuelTypeSelector component.
 * Renders a toggle group for selecting fuel type (E5, E10, Diesel).
 * Purely presentational — receives value and onChange from parent.
 */

import type { ReactNode } from "react"; // ReactNode type
import type { FuelType } from "../../types/fuel"; // FuelType union type
import "./FuelTypeSelector.css"; // Co-located styles

/** Display configuration for each fuel type. */
const FUEL_OPTIONS: readonly { value: FuelType; label: string }[] = [
  { value: "e5", label: "E5" }, // Super E5
  { value: "e10", label: "E10" }, // Super E10
  { value: "diesel", label: "Diesel" }, // Diesel
] as const;

/** Props interface for the FuelTypeSelector component. */
interface FuelTypeSelectorProps {
  value: FuelType; // Currently selected fuel type
  onChange: (fuel: FuelType) => void; // Callback when selection changes
}

/**
 * Renders a fuel type toggle group.
 * Highlights the currently selected fuel type.
 * @param props - Selected value and change handler.
 * @returns The fuel type selector element.
 */
export function FuelTypeSelector({
  value, // Current selection
  onChange, // Selection handler
}: FuelTypeSelectorProps): ReactNode {
  return (
    <fieldset
      className="fuel-type-selector" // BEM block
      aria-label="Fuel type" // Accessible group label
    >
      <legend className="sr-only">Fuel type</legend>{" "}
      {/* Hidden legend for a11y */}
      {FUEL_OPTIONS.map(({ value: fuelValue, label }) => (
        <button
          key={fuelValue} // Unique key per fuel type
          type="button" // Explicit button type
          className={`fuel-type-selector__button ${
            value === fuelValue ? "fuel-type-selector__button--active" : "" // Active modifier
          }`}
          aria-pressed={value === fuelValue} // Toggle state for assistive tech
          onClick={() => onChange(fuelValue)} // Trigger change callback
        >
          <span
            className="fuel-type-selector__dot" // Color indicator dot
            style={{ backgroundColor: `var(--fuel-${fuelValue}-color)` }} // Fuel-specific color token
            aria-hidden="true" // Decorative element
          />
          {label} {/* Fuel type label */}
        </button>
      ))}
    </fieldset>
  );
}
