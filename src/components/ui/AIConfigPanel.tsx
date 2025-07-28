"use client";

import React from "react";
import { AIDifficulty } from "@/utils/aiService";
import { Player } from "@/types/game";

interface AIConfigPanelProps {
  aiPlayer: Player | null;
  onSetAIPlayer: (player: Player | null) => void;
  aiDifficulty: AIDifficulty;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  language: "zh" | "en";
}

export default function AIConfigPanel({
  aiPlayer,
  onSetAIPlayer,
  aiDifficulty,
  onDifficultyChange,
  language,
}: AIConfigPanelProps) {
  const content = {
    zh: {
      title: "AI 遊戲模式",
      players: "選擇 AI 玩家",
      difficulty: "AI 難度",
      humanVsHuman: "雙人遊戲",
      humanVsAI: "對戰 AI",
      redAI: "紅方 AI",
      blueAI: "藍方 AI",
      difficulties: {
        easy: "簡單",
        medium: "中等", 
        hard: "困難",
        expert: "專家",
      },
    },
    en: {
      title: "AI Game Mode",
      players: "Choose AI Players",
      difficulty: "AI Difficulty",
      humanVsHuman: "Human vs Human",
      humanVsAI: "Human vs AI",
      redAI: "Red AI",
      blueAI: "Blue AI",
      difficulties: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard", 
        expert: "Expert",
      },
    },
  };

  const difficulties: AIDifficulty[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-stone-700 zen-text">
        {content[language].title}
      </h3>

      {/* AI Player Selection */}
      <div>
        <h4 className="text-xs font-medium text-stone-600 mb-2 zen-text">
          {content[language].players}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSetAIPlayer(null)}
            className={`px-3 py-2 text-xs rounded border transition-colors zen-text ${
              aiPlayer === null
                ? "border-stone-600 bg-stone-100 text-stone-800"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            {content[language].humanVsHuman}
          </button>
          <button
            onClick={() => onSetAIPlayer(aiPlayer === "red" ? "blue" : "red")}
            className={`px-3 py-2 text-xs rounded border transition-colors zen-text ${
              aiPlayer !== null
                ? "border-stone-600 bg-stone-100 text-stone-800"
                : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
            }`}
          >
            {content[language].humanVsAI}
          </button>
        </div>
        
        {aiPlayer && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onSetAIPlayer("red")}
              className={`px-3 py-1.5 text-xs rounded border transition-colors zen-text ${
                aiPlayer === "red"
                  ? "border-red-500 bg-red-50 text-red-800"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {content[language].redAI}
            </button>
            <button
              onClick={() => onSetAIPlayer("blue")}
              className={`px-3 py-1.5 text-xs rounded border transition-colors zen-text ${
                aiPlayer === "blue"
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {content[language].blueAI}
            </button>
          </div>
        )}
      </div>

      {/* Difficulty Selection */}
      {aiPlayer && (
        <div>
          <h4 className="text-xs font-medium text-stone-600 mb-2 zen-text">
            {content[language].difficulty}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => onDifficultyChange(diff)}
                className={`px-3 py-2 text-xs rounded border transition-colors zen-text ${
                  aiDifficulty === diff
                    ? "border-stone-600 bg-stone-100 text-stone-800"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {content[language].difficulties[diff]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}