/**
 * Skeleton component.
 * Displays placeholder loading blocks using the global shimmer animation.
 */

import type { ReactNode } from "react"; // ReactNode type
import "./Skeleton.css"; // Co-located styles

/** Props interface for the Skeleton component. */
interface SkeletonProps {
  variant?: "text" | "title" | "card" | "circle"; // Shape variant
  lines?: number; // Number of placeholder lines to render
  ariaLabel?: string; // Accessible label for the loading region
}

/**
 * Renders shimmer placeholder blocks for content loading states.
 * Uses the global .skeleton class for shimmer animation.
 * @param props - Skeleton configuration.
 * @returns The skeleton placeholder element.
 */
export function Skeleton({
  variant = "text", // Default to text variant
  lines = 1, // Default to single line
  ariaLabel = "Loading content", // Default accessible label
}: SkeletonProps): ReactNode {
  /* Circle variant renders a single circular placeholder */
  if (variant === "circle") {
    return (
      <div
        className="skeleton-wrapper" // Wrapper for status role
        role="status" // Announce as loading status
        aria-label={ariaLabel} // Accessible label
      >
        <div
          className="skeleton skeleton-block skeleton-block--circle" // BEM circle modifier + global skeleton class
          aria-hidden="true" // Decorative element
        />
        <span className="sr-only">{ariaLabel}</span> {/* Screen reader text */}
      </div>
    );
  }

  /* Card variant renders a single card-shaped placeholder */
  if (variant === "card") {
    return (
      <div
        className="skeleton-wrapper" // Wrapper for status role
        role="status" // Announce as loading status
        aria-label={ariaLabel} // Accessible label
      >
        <div
          className="skeleton skeleton-block skeleton-block--card" // BEM card modifier + global skeleton class
          aria-hidden="true" // Decorative element
        />
        <span className="sr-only">{ariaLabel}</span> {/* Screen reader text */}
      </div>
    );
  }

  /* Text and title variants render multiple lines */
  return (
    <div
      className="skeleton-wrapper" // Wrapper for status role
      role="status" // Announce as loading status
      aria-label={ariaLabel} // Accessible label
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index} // Unique key for each line
          className={`skeleton skeleton-block skeleton-block--${variant}`} // BEM variant modifier + global skeleton class
          aria-hidden="true" // Decorative element
        />
      ))}
      <span className="sr-only">{ariaLabel}</span> {/* Screen reader text */}
    </div>
  );
}
