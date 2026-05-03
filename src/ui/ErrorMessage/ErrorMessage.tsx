/**
 * ErrorMessage component.
 * Displays a user-friendly error with optional retry action.
 * Receives already-translated strings — no i18n logic inside.
 */

import type { ReactNode } from "react"; // ReactNode type
import "./ErrorMessage.css"; // Co-located styles

/** Props interface for the ErrorMessage component. */
interface ErrorMessageProps {
  title?: string; // Error heading text
  message: string; // Error description text
  actionLabel?: string; // Button label for retry/action
  onAction?: () => void; // Callback when action button is clicked
}

/**
 * Renders an accessible error message with optional action button.
 * Uses role="alert" for immediate screen reader announcement.
 * @param props - Error message configuration.
 * @returns The error message element.
 */
export function ErrorMessage({
  title = "Something went wrong", // Default error heading
  message, // Required error description
  actionLabel, // Optional button text
  onAction, // Optional button handler
}: ErrorMessageProps): ReactNode {
  return (
    <div
      className="error-message fade-in" // BEM block + global fade-in animation
      role="alert" // Immediate announcement to screen readers
    >
      {/* Error heading */}
      <h2 className="error-message__title">{title}</h2>

      {/* Error description */}
      <p className="error-message__body">{message}</p>

      {/* Action button — only rendered when both label and handler exist */}
      {actionLabel && onAction && (
        <button
          className="error-message__action" // BEM element
          type="button" // Explicit button type
          onClick={onAction} // Trigger retry/action callback
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
