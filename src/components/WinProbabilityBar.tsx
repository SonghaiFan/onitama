"use client";

import React from "react";
import { WinProbability } from "@/utils/ai/winProbability";
import { Player } from "@/types/game";

interface WinProbabilityBarProps {
  winProbability: WinProbability;
  language?: "zh" | "en";
  isAITurn?: boolean;
  aiPlayer?: Player | null;
  className?: string;
}

const content = {
  zh: {
    red: "紅方",
    blue: "藍方",
    aiThinking: "AI 深度演算中...",
    balanced: "勢均力敵",
    redSlightLead: "紅方微優",
    redLead: "紅方占優",
    redClearLead: "紅方大優",
    redWinning: "紅方勝勢",
    blueSlightLead: "藍方微優",
    blueLead: "藍方占優",
    blueClearLead: "藍方大優",
    blueWinning: "藍方勝勢",
    aiTag: "AI",
    winRate: "獲勝概率",
  },
  en: {
    red: "Red",
    blue: "Blue",
    aiThinking: "AI Calculating...",
    balanced: "Balanced",
    redSlightLead: "Slight Red Lead",
    redLead: "Red Advantage",
    redClearLead: "Clear Red Lead",
    redWinning: "Red Winning",
    blueSlightLead: "Slight Blue Lead",
    blueLead: "Blue Advantage",
    blueClearLead: "Clear Blue Lead",
    blueWinning: "Blue Winning",
    aiTag: "AI",
    winRate: "Win Probability",
  },
};

export function WinProbabilityBar({
  winProbability,
  language = "zh",
  isAITurn = false,
  aiPlayer = null,
  className = "",
}: WinProbabilityBarProps) {
  const t = content[language];
  const redPercent = Math.min(100, Math.max(0, winProbability.red));
  const bluePercent = Math.min(100, Math.max(0, winProbability.blue));

  // Determine tactical status description
  const getStatusText = () => {
    if (isAITurn) return t.aiThinking;

    if (redPercent >= 95) return t.redWinning;
    if (bluePercent >= 95) return t.blueWinning;

    const diff = redPercent - bluePercent;
    if (Math.abs(diff) < 5) return t.balanced;

    if (diff > 0) {
      if (diff < 18) return t.redSlightLead;
      if (diff < 35) return t.redLead;
      return t.redClearLead;
    } else {
      const absDiff = Math.abs(diff);
      if (absDiff < 18) return t.blueSlightLead;
      if (absDiff < 35) return t.blueLead;
      return t.blueClearLead;
    }
  };

  return (
    <div
      className={`w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] mx-auto px-2 py-1.5 sm:px-3 sm:py-2 bg-stone-50/85 backdrop-blur-xs border border-stone-200/90 rounded-xl shadow-xs transition-all duration-300 select-none ${className}`}
    >
      {/* Header: Team labels, scores, and status */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
        {/* Red Player info */}
        <div className="flex items-center space-x-1.5 min-w-[70px]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-xs shadow-red-300 inline-block" />
          <span className="font-bold text-red-700 zen-text">
            {t.red}
            {aiPlayer === "red" && (
              <span className="ml-1 text-[10px] px-1 py-0.2 bg-red-100 text-red-700 rounded-sm font-normal">
                {t.aiTag}
              </span>
            )}
          </span>
          <span className="text-red-700 font-mono font-bold text-xs sm:text-sm">
            {redPercent.toFixed(redPercent % 1 === 0 ? 0 : 1)}%
          </span>
        </div>

        {/* Center: Dynamic tactical momentum badge */}
        <div className="flex-1 text-center px-1">
          <span
            className={`inline-flex items-center text-[11px] sm:text-xs px-2 py-0.5 rounded-full font-serif ${
              isAITurn
                ? "bg-amber-100/80 text-amber-800 animate-pulse border border-amber-200"
                : redPercent > 55
                ? "bg-red-50 text-red-700 border border-red-200/60"
                : bluePercent > 55
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-stone-100 text-stone-600 border border-stone-200"
            }`}
          >
            {isAITurn && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-ping" />
            )}
            {getStatusText()}
          </span>
        </div>

        {/* Blue Player info */}
        <div className="flex items-center justify-end space-x-1.5 min-w-[70px]">
          <span className="text-blue-700 font-mono font-bold text-xs sm:text-sm">
            {bluePercent.toFixed(bluePercent % 1 === 0 ? 0 : 1)}%
          </span>
          <span className="font-bold text-blue-700 zen-text">
            {t.blue}
            {aiPlayer === "blue" && (
              <span className="ml-1 text-[10px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded-sm font-normal">
                {t.aiTag}
              </span>
            )}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-xs shadow-blue-300 inline-block" />
        </div>
      </div>

      {/* The Win Probability Progress Bar */}
      <div className="relative h-2 sm:h-2.5 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
        {/* Red Bar Segment */}
        <div
          style={{ width: `${redPercent}%` }}
          className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-700 ease-out relative"
        />

        {/* Dynamic Frontline Separator */}
        <div className="w-[1.5px] h-full bg-white/90 shadow-xs z-10" />

        {/* Blue Bar Segment */}
        <div
          style={{ width: `${bluePercent}%` }}
          className={`h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out relative ${
            isAITurn && aiPlayer === "blue" ? "animate-pulse" : ""
          }`}
        />
      </div>
    </div>
  );
}

export default WinProbabilityBar;
