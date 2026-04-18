/**
 * usePriceAnalysis.ts
 * Custom React hook for price scoring, golden hour, and trend analysis.
 */

import { useCallback, useState } from "react"; // React hooks for state and lifecycle
import { analyzePriceScore } from "../utils/scoring"; // Price scoring algorithm
import { analyzeGoldenHour } from "../utils/goldenHour"; // Golden hour analysis
import { getTodayTrend, isCheapDay } from "../utils/weeklyTrends"; // Trend data utilities
import type { PriceScore, GoldenHourResult, TrendDay } from "../types/analysis"; // Analysis result types

/**
 * Return type for usePriceAnalysis hook.
 */
export interface UsePriceAnalysisResult {
  goldenHour: GoldenHourResult; // Current golden hour analysis result
  todayTrend: TrendDay; // Today's trend data
  isCheapToday: boolean; // Whether today is a "cheap" day for fuel
  getStationScore: (currentPrice: number, dailyAverage: number) => PriceScore; // Pure price scoring function
  refreshAnalysis: () => void; // Re-run golden hour and trend analysis
}

/**
 * usePriceAnalysis
 *
 * Combines price scoring, golden hour, and trend analysis for stations.
 * Exposes stable scoring function and refresh logic.
 *
 * @returns {UsePriceAnalysisResult} Hook state and analysis functions
 */
export function usePriceAnalysis(): UsePriceAnalysisResult {
  // Helper to get the current hour (0-23)
  const getCurrentHour = (): number => new Date().getHours();

  // State for golden hour analysis result, initialized on first render
  const [goldenHour, setGoldenHour] = useState<GoldenHourResult>(() =>
    analyzeGoldenHour(getCurrentHour()),
  );
  // State for today's trend data, initialized on first render
  const [todayTrend, setTodayTrend] = useState<TrendDay>(() => getTodayTrend());
  // State for whether today is a "cheap" day, initialized on first render
  const [isCheapToday, setIsCheapToday] = useState<boolean>(() => isCheapDay());

  // Stable callback for price scoring (does not update state)
  const getStationScore = useCallback(
    (currentPrice: number, dailyAverage: number): PriceScore => {
      // Calculate and return the price score for a station
      return analyzePriceScore(currentPrice, dailyAverage);
    },
    [],
  );

  // Refresh golden hour and trend analysis with current time
  const refreshAnalysis = useCallback((): void => {
    const hour = getCurrentHour(); // Get current hour as number
    setGoldenHour(analyzeGoldenHour(hour)); // Update golden hour state
    setTodayTrend(getTodayTrend()); // Update today's trend state
    setIsCheapToday(isCheapDay()); // Update cheap day state
  }, []);

  // Return hook state and functions
  return {
    goldenHour,
    todayTrend,
    isCheapToday,
    getStationScore,
    refreshAnalysis,
  };
}
