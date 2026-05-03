/**
 * ScoreBadge component.
 * Displays a pill-shaped badge with semantic color
 * based on the price score (0-100).
 */

import type { ReactNode } from "react"; // ReactNode type
import { useTranslation } from "../../hooks/useTranslation"; // Translation hook
import "./ScoreBadge.css"; // Co-located styles

/** Props interface for the ScoreBadge component. */
interface ScoreBadgeProps {
  score: number; // Price score value (0-100)
}

/** Score tier label and CSS modifier. */
interface ScoreTier {
  modifier: "great" | "fair" | "expensive"; // BEM modifier
  labelKey: string; // Translation key for tier label
}

/**
 * Determines the score tier based on numeric value.
 * 80-100: Great Deal, 50-79: Fair Price, 0-49: Expensive.
 * @param score - Numeric score (0-100).
 * @returns Tier info with BEM modifier and label key.
 */
function getScoreTier(score: number): ScoreTier {
  if (score >= 80) {
    return { modifier: "great", labelKey: "score.great" }; // Great deal tier
  }
  if (score >= 50) {
    return { modifier: "fair", labelKey: "score.fair" }; // Fair price tier
  }
  return { modifier: "expensive", labelKey: "score.expensive" }; // Expensive tier
}

/**
 * Renders a pill-shaped score badge with semantic coloring.
 * Uses design token score colors for each tier.
 * @param props - Score value.
 * @returns The score badge element.
 */
export function ScoreBadge({ score }: ScoreBadgeProps): ReactNode {
  const { t } = useTranslation(); // Get translation function
  const { modifier, labelKey } = getScoreTier(score); // Determine tier

  return (
    <span
      className={`score-badge score-badge--${modifier}`} // BEM block + tier modifier
      role="img" // Treat as image for screen readers
      aria-label={t("a11y.scoreBadge", {
        score: String(score), // Score as string for interpolation
        rating: t(labelKey), // Translated tier label
      })}
    >
      <span className="score-badge__value" aria-hidden="true">
        {score} {/* Numeric score display */}
      </span>
      <span className="score-badge__label" aria-hidden="true">
        {t(labelKey)} {/* Translated tier text */}
      </span>
    </span>
  );
}
