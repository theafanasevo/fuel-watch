/**
 * Spinner component.
 * Displays a CSS-only loading indicator with accessible status announcement.
 */

import type { ReactNode } from "react"; // ReactNode type
import "./Spinner.css"; // Co-located styles

/** Props interface for the Spinner component. */
interface SpinnerProps {
  size?: "sm" | "md" | "lg"; // Spinner size variant
  label?: string; // Accessible label for screen readers
}

/**
 * Renders a spinning loading indicator.
 * Uses role="status" for screen reader announcements.
 * @param props - Spinner configuration.
 * @returns The spinner element.
 */
export function Spinner({
  size = "md", // Default to medium size
  label = "Loading", // Default accessible label
}: SpinnerProps): ReactNode {
  return (
    <div
      className={`spinner spinner--${size}`} // BEM with size modifier
      role="status" // Announce as status to assistive tech
      aria-live="polite" // Polite announcement priority
    >
      <div className="spinner__circle" aria-hidden="true" />{" "}
      {/* Visual spinner element */}
      <span className="sr-only">{label}</span>{" "}
      {/* Hidden text for screen readers */}
    </div>
  );
}
