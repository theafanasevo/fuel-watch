/**
 * src/utils/scoring.ts
 *
 * Price scoring utilities for Fuel-Watch that compare a station's current price
 * against the daily area average and compute a normalized score and rating.
 */ // file header comment
import type { PriceScore, ScoreRating } from "../types/analysis"; // import analysis types
import { SCORE_THRESHOLDS } from "./constants"; // import score thresholds from constants

/** Minimum difference (EUR) used as lower bound for great-deal interpolation (-0.50 EUR). */ // constant comment
const GREAT_LOWER_BOUND = -0.5; // -50 cents lower bound for best deals
/** Upper boundary for the great-deal interpolation window (exclusive threshold -0.05 EUR). */ // constant comment
const GREAT_UPPER_BOUND = SCORE_THRESHOLDS.greatDeal; // typically -0.05 from constants
/** Lower boundary for fair-price window (inclusive -0.05 EUR). */ // constant comment
const FAIR_LOWER_BOUND = SCORE_THRESHOLDS.greatDeal; // -0.05 inclusive for fair window
/** Upper boundary for fair-price window (inclusive 0.00 EUR). */ // constant comment
const FAIR_UPPER_BOUND = 0.0; // 0 difference is end of fair window
/** Upper bound for expensive interpolation window (0.50 EUR -> 0 score). */ // constant comment
const EXPENSIVE_UPPER_BOUND = 0.5; // +50 cents maps to 0 score

/** Clamp a numeric value between min and max (inclusive). */ // helper comment
function clamp(value: number, min: number, max: number): number {
  // clamp function signature
  if (value < min) return min; // lower clamp
  if (value > max) return max; // upper clamp
  return value; // return when within range
} // end clamp

/** Linear interpolation helper: interpolate from [a..b] to [x..y] for t in [0..1]. */ // helper comment
function lerp(a: number, b: number, t: number): number {
  // lerp function signature
  return a + (b - a) * t; // linear interpolation formula
} // end lerp

/**
 * calculatePriceDifference
 *
 * Compute the raw price difference in Euros between the station's current
 * price and the daily area average: currentPrice - dailyAverage.
 *
 * @param currentPrice - the station's current price (EUR per liter)
 * @param dailyAverage - the area's daily average price (EUR per liter)
 * @returns number - the raw difference in EUR (can be negative when cheaper)
 */ // JSDoc for calculatePriceDifference
export function calculatePriceDifference(
  currentPrice: number,
  dailyAverage: number,
): number {
  // function signature
  const diff = currentPrice - dailyAverage; // compute difference
  return diff; // return raw difference in EUR
} // end calculatePriceDifference

/**
 * calculateScore
 *
 * Map a price difference (current - average in EUR) to an integer score
 * in the range 0..100 using linear interpolation ranges per project rules:
 *  - difference < -0.05 -> Great Deal -> score 80..100
 *  - -0.05 <= difference <= 0 -> Fair Price -> score 50..79
 *  - difference > 0 -> Expensive -> score 0..49
 *
 * @param difference - price difference in EUR (currentPrice - dailyAverage)
 * @returns number - integer score between 0 and 100
 */ // JSDoc for calculateScore
export function calculateScore(difference: number): number {
  // function signature
  // Great deal branch (difference strictly less than -0.05 per rules)
  if (difference < FAIR_LOWER_BOUND) {
    // check for great deal
    // Normalize difference into [0..1] across [GREAT_LOWER_BOUND .. GREAT_UPPER_BOUND)
    const clamped = clamp(difference, GREAT_LOWER_BOUND, GREAT_UPPER_BOUND); // clamp to interpolation domain
    const t =
      (clamped - GREAT_LOWER_BOUND) / (GREAT_UPPER_BOUND - GREAT_LOWER_BOUND); // normalized 0..1
    const score = lerp(100, 80, 1 - t); // map so most negative -> 100, near -0.05 -> 80
    return Math.round(clamp(score, 80, 100)); // ensure integer and bounds
  } // end great branch

  // Fair price branch (difference between -0.05 and 0 inclusive)
  if (difference <= FAIR_UPPER_BOUND) {
    // check for fair range (includes -0.05 and 0)
    const clamped = clamp(difference, FAIR_LOWER_BOUND, FAIR_UPPER_BOUND); // clamp within fair window
    const t =
      (clamped - FAIR_LOWER_BOUND) / (FAIR_UPPER_BOUND - FAIR_LOWER_BOUND); // 0..1 across -0.05..0
    const score = lerp(79, 50, t); // map -0.05->79 down to 0->50 (descending with t)
    return Math.round(clamp(score, 50, 79)); // integer and bounds
  } // end fair branch

  // Expensive branch (difference > 0)
  // Map small increases to 49 down to 0 for larger increases up to EXPENSIVE_UPPER_BOUND
  const clampedExp = clamp(difference, 0, EXPENSIVE_UPPER_BOUND); // clamp within [0..EXPENSIVE_UPPER_BOUND]
  const tExp = clampedExp / EXPENSIVE_UPPER_BOUND; // normalize 0..1
  const scoreExp = lerp(49, 0, tExp); // map 0->49 down to EXPENSIVE_UPPER_BOUND->0
  return Math.round(clamp(scoreExp, 0, 49)); // integer and bounds
} // end calculateScore

/**
 * getScoreRating
 *
 * Convert a numeric score into a categorical ScoreRating used by the domain.
 *
 * Mapping:
 *  - score >= 80 -> GreatDeal
 *  - score >= 50 -> FairPrice
 *  - otherwise    -> Expensive
 *
 * @param score - numeric score 0..100
 * @returns ScoreRating - categorical rating (GreatDeal | FairPrice | Expensive)
 */ // JSDoc for getScoreRating
export function getScoreRating(score: number): ScoreRating {
  // function signature
  const s = Math.round(score); // normalize score to integer
  if (s >= 80) return "GreatDeal"; // great deal threshold
  if (s >= 50) return "FairPrice"; // fair price threshold
  return "Expensive"; // expensive for anything below 50
} // end getScoreRating

/**
 * analyzePriceScore
 *
 * Main entry combining the smaller helpers:
 *  - computes difference
 *  - computes score from difference
 *  - resolves rating from score
 *
 * The returned object includes the PriceScore fields plus the provided
 * `currentPrice` and `dailyAverage` for convenience to calling layers.
 *
 * @param currentPrice - station current price in EUR per liter
 * @param dailyAverage - area daily average price in EUR per liter
 * @returns PriceScore & { currentPrice: number; dailyAverage: number } - full analysis
 */ // JSDoc for analyzePriceScore
export function analyzePriceScore( // function signature
  currentPrice: number, // current station price
  dailyAverage: number, // daily area average price
): PriceScore & { currentPrice: number; dailyAverage: number } {
  // explicit return type
  const differenceEur = calculatePriceDifference(currentPrice, dailyAverage); // compute raw difference
  const score = calculateScore(differenceEur); // convert difference to normalized score
  const rating = getScoreRating(score); // derive semantic rating from score

  // Build an explanatory string in English as a fallback; UI should localize this.
  const cents = Math.round(Math.abs(differenceEur) * 100); // convert EUR difference to cents
  const explanation =
    differenceEur < 0
      ? `cheaper by ${cents} cents vs. area average` // message for cheaper stations
      : differenceEur > 0
        ? `more expensive by ${cents} cents vs. area average` // message for pricier stations
        : `price matches area average`; // message for equal price

  return {
    score, // numeric 0..100
    rating, // categorical rating per ScoreRating
    differenceEur, // raw difference in EUR
    explanation, // human-friendly explanation (not localized)
    currentPrice, // include input currentPrice for convenience
    dailyAverage, // include input dailyAverage for convenience
  }; // return composed result
} // end analyzePriceScore

export default {
  // default export convenience object
  calculatePriceDifference, // export calculatePriceDifference
  calculateScore, // export calculateScore
  getScoreRating, // export getScoreRating
  analyzePriceScore, // export analyzePriceScore
}; // end default export
