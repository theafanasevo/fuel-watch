/**
 * Utility functions for formatting timestamps and hours for display.
 */

/**
 * Formats an ISO timestamp as a relative time string (e.g., "2 min ago").
 * @param timestamp - The ISO 8601 timestamp string or number (ms).
 * @returns {string} Relative time string or "—" if input is null/undefined.
 */
export function formatRelativeTime(
  timestamp: string | number | null | undefined,
): string {
  if (timestamp === null || timestamp === undefined || timestamp === "") {
    return "—";
  }
  const now: number = Date.now();
  const time: number =
    typeof timestamp === "string" ? Date.parse(timestamp) : timestamp;
  if (Number.isNaN(time)) {
    return "—";
  }
  const diffMs: number = now - time;
  const diffSec: number = Math.floor(diffMs / 1000);
  const diffMin: number = Math.floor(diffSec / 60);
  const diffHour: number = Math.floor(diffMin / 60);
  const diffDay: number = Math.floor(diffHour / 24);

  // Try Intl.RelativeTimeFormat if available
  const locale: string =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "de-DE";
  if (typeof Intl !== "undefined" && "RelativeTimeFormat" in Intl) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (diffSec < 60) return rtf.format(-diffSec, "second");
    if (diffMin < 60) return rtf.format(-diffMin, "minute");
    if (diffHour < 24) return rtf.format(-diffHour, "hour");
    return rtf.format(-diffDay, "day");
  }

  // Fallback manual formatting
  if (diffSec < 60) {
    return locale.startsWith("de") ? "vor wenigen Sekunden" : "just now";
  }
  if (diffMin < 60) {
    return locale.startsWith("de")
      ? `vor ${diffMin} Min.`
      : `${diffMin} min ago`;
  }
  if (diffHour < 24) {
    return locale.startsWith("de")
      ? `vor ${diffHour} Std.`
      : `${diffHour} hr ago`;
  }
  return locale.startsWith("de") ? `vor ${diffDay} Tg.` : `${diffDay} days ago`;
}

/**
 * Formats a 24-hour number as a readable time string (e.g., "21:00").
 * @param hour - The hour in 24h format (0-23).
 * @returns {string} Formatted hour string (e.g., "09:00").
 */
export function formatHour(hour: number): string {
  const h: string = hour < 10 ? `0${hour}` : `${hour}`;
  return `${h}:00`;
}
