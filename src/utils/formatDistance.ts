/**
 * Utility function for formatting distances in meters or kilometers.
 */

/**
 * Formats a distance in meters as a readable string (e.g., "2,3 km" or "500 m").
 * @param meters - The distance in meters.
 * @param locale - Optional BCP 47 locale string (default: "de-DE").
 * @returns {string} Formatted distance string or "—" if input is null/undefined.
 */
export function formatDistance(
  meters: number | null | undefined,
  locale: string = "de-DE",
): string {
  if (meters === null || meters === undefined || Number.isNaN(meters)) {
    return "—";
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km: number = meters / 1000;
  return (
    new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(km) + " km"
  );
}
