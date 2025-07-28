"use client";

import React from "react";
import { getPlayerColors } from "@/utils/gameAestheticConfig";
import { Player } from "@/types/game";

interface AIThinkingIndicatorProps {
  isThinking: boolean;
  player: Player;
  language: "zh" | "en";
  className?: string;
}

const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  isThinking,
  player,
  language,
  className = "",
}) => {
  const content = {
    zh: {
      thinking: "AI 思考中...",
      calculating: "計算最佳移動",
    },
    en: {
      thinking: "AI Thinking...",
      calculating: "Calculating best move",
    },
  };

  if (!isThinking) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full animate-pulse ${
              getPlayerColors(player).tailwind.text
            }`}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span
          className={`text-sm font-medium zen-text ${
            getPlayerColors(player).tailwind.text
          }`}
        >
          {content[language].thinking}
        </span>
        <span className="text-xs text-stone-500 zen-text">
          {content[language].calculating}
        </span>
      </div>
    </div>
  );
};

export default AIThinkingIndicator;
