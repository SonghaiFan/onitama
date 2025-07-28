"use client";

import React from "react";
import { AIDifficulty, AIService } from "@/utils/aiService";
import { getPlayerColors } from "@/utils/gameAestheticConfig";

interface AISettingsProps {
  difficulty: AIDifficulty;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  language: "zh" | "en";
  className?: string;
}

const AISettings: React.FC<AISettingsProps> = ({
  difficulty,
  onDifficultyChange,
  language,
  className = "",
}) => {
  const difficulties: AIDifficulty[] = ["easy", "medium", "hard", "expert"];

  const content = {
    zh: {
      title: "AI 難度",
      easy: "簡單",
      medium: "中等",
      hard: "困難",
      expert: "專家",
    },
    en: {
      title: "AI Difficulty",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      expert: "Expert",
    },
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-stone-700 zen-text">
        {content[language].title}
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {difficulties.map((diff) => (
          <button
            key={diff}
            onClick={() => onDifficultyChange(diff)}
            className={`
              relative px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200
              border-2 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-opacity-50
              ${
                difficulty === diff
                  ? "border-stone-600 bg-stone-100 text-stone-800 shadow-sm"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-400 hover:bg-stone-50"
              }
            `}
          >
            <span className="block">{content[language][diff]}</span>
            <span className="block text-xs opacity-60 mt-0.5">
              {
                AIService.getDifficultyDescription(diff, language).split(
                  " - "
                )[1]
              }
            </span>
          </button>
        ))}
      </div>

      <div className="text-xs text-stone-500 zen-text leading-relaxed">
        {AIService.getDifficultyDescription(difficulty, language)}
      </div>
    </div>
  );
};

export default AISettings;
