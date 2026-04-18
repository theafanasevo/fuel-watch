/**
 * Utility functions for formatting fuel prices for display and accessibility.
 */

/**
 * Formats a number as a fuel price string (e.g., "1,459 €").
 * @param price - The numeric price per liter.
 * @param locale - Optional BCP 47 locale string (default: "de-DE").
 * @returns {string} Formatted price string or "—" if input is null/undefined.
 */
export function formatPrice(
  price: number | null | undefined,
  locale: string = "de-DE",
): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return "—";
  }
  return (
    new Intl.NumberFormat(locale, {
      style: "decimal",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price) + " €"
  );
}

/**
 * Formats a number as spoken text for screen readers (e.g., "1 Euro 81 cents").
 * @param price - The numeric price per liter.
 * @param locale - Optional BCP 47 locale string ("en" or "de", default: "de-DE").
 * @returns {string} Spoken price string or empty string if input is null/undefined.
 */
export function formatPriceForScreenReader(
  price: number | null | undefined,
  locale: string = "de-DE",
): string {
  if (price === null || price === undefined || Number.isNaN(price)) {
    return "";
  }
  const lang: string = locale.startsWith("de") ? "de" : "en";
  const euros: number = Math.floor(price);
  const cents: number = Math.round((price - euros) * 100);

  if (lang === "de") {
    if (cents === 0) {
      return `${euros} Euro`;
    }
    return `${euros} Euro ${cents} Cent`;
  } else {
    if (cents === 0) {
      return `${euros} Euro`;
    }
    return `${euros} Euro ${cents} cents`;
  }
}
