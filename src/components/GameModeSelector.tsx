"use client";

import React, { useState } from "react";
import { Player } from "@/types/game";

// Bilingual content for game mode selection
const modeContent = {
  zh: {
    selectMode: "選擇遊戲模式",
    humanVsHuman: "人類對戰人類",
    humanVsAI: "人類對戰AI",
    aiVsAI: "AI對戰AI",
    selectDifficulty: "選擇AI難度",
    easy: "簡單",
    medium: "中等",
    hard: "困難",
    selectAIPlayer: "選擇AI玩家",
    redPlayer: "紅方",
    bluePlayer: "藍方",
    startGame: "開始遊戲",
    cancel: "取消",
    bothPlayers: "雙方",
  },
  en: {
    selectMode: "Select Game Mode",
    humanVsHuman: "Human vs Human",
    humanVsAI: "Human vs AI",
    aiVsAI: "AI vs AI",
    selectDifficulty: "Select AI Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    selectAIPlayer: "Select AI Player",
    redPlayer: "Red",
    bluePlayer: "Blue",
    startGame: "Start Game",
    cancel: "Cancel",
    bothPlayers: "Both",
  },
};

export type GameMode = "human_vs_human" | "human_vs_ai" | "ai_vs_ai";

export interface GameModeConfig {
  mode: GameMode;
  aiPlayer?: Player | "both";
  difficulty: "easy" | "medium" | "hard";
}

interface GameModeSelectorProps {
  onModeSelect: (config: GameModeConfig) => void;
  onCancel: () => void;
  language?: "zh" | "en";
}

export default function GameModeSelector({
  onModeSelect,
  onCancel,
  language = "zh",
}: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("human_vs_human");
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("medium");
  const [selectedAIPlayer, setSelectedAIPlayer] = useState<Player | "both">(
    "blue"
  );

  const content = modeContent[language];

  const handleStartGame = () => {
    const config: GameModeConfig = {
      mode: selectedMode,
      difficulty: selectedDifficulty,
    };

    if (selectedMode !== "human_vs_human") {
      config.aiPlayer = selectedAIPlayer;
    }

    onModeSelect(config);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="card-elevated max-w-md w-full mx-4">
        <div className="card-header text-center">
          <h2 className="card-title text-2xl">
            {content.selectMode}
          </h2>
        </div>

        <div className="card-body space-y-8">
          {/* Game Mode Selection */}
          <div>
            <h3 className="text-sm font-light text-stone-600 mb-4 zen-text">
              {content.selectMode}
            </h3>
            <div className="space-y-3">
              {[
                { value: "human_vs_human", label: content.humanVsHuman },
                { value: "human_vs_ai", label: content.humanVsAI },
                { value: "ai_vs_ai", label: content.aiVsAI },
              ].map((mode) => (
                <label
                  key={mode.value}
                  className="flex items-center space-x-4 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="gameMode"
                    value={mode.value}
                    checked={selectedMode === mode.value}
                    onChange={(e) =>
                      setSelectedMode(e.target.value as GameMode)
                    }
                    className="w-4 h-4 text-stone-600 border-stone-300 focus:ring-stone-500"
                  />
                  <span className="text-stone-700 zen-text group-hover:text-stone-900 transition-colors">
                    {mode.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* AI Difficulty Selection */}
          {(selectedMode === "human_vs_ai" || selectedMode === "ai_vs_ai") && (
            <div>
              <h3 className="text-sm font-light text-stone-600 mb-4 zen-text">
                {content.selectDifficulty}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    value: "easy",
                    label: content.easy,
                    color: "bg-green-500",
                  },
                  {
                    value: "medium",
                    label: content.medium,
                    color: "bg-yellow-500",
                  },
                  {
                    value: "hard",
                    label: content.hard,
                    color: "bg-red-500",
                  },
                ].map((difficulty) => (
                  <label
                    key={difficulty.value}
                    className="flex items-center space-x-4 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={difficulty.value}
                      checked={selectedDifficulty === difficulty.value}
                      onChange={(e) =>
                        setSelectedDifficulty(
                          e.target.value as "easy" | "medium" | "hard"
                        )
                      }
                      className="w-4 h-4 text-stone-600 border-stone-300 focus:ring-stone-500"
                    />
                    <span className="text-stone-700 zen-text group-hover:text-stone-900 transition-colors">
                      {difficulty.label}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${difficulty.color}`}
                    ></div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* AI Player Selection */}
          {selectedMode === "human_vs_ai" && (
            <div>
              <h3 className="text-sm font-light text-stone-600 mb-4 zen-text">
                {content.selectAIPlayer}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    value: "red",
                    label: content.redPlayer,
                    color: "bg-red-600",
                  },
                  {
                    value: "blue",
                    label: content.bluePlayer,
                    color: "bg-blue-600",
                  },
                ].map((player) => (
                  <label
                    key={player.value}
                    className="flex items-center space-x-4 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="aiPlayer"
                      value={player.value}
                      checked={selectedAIPlayer === player.value}
                      onChange={(e) =>
                        setSelectedAIPlayer(e.target.value as Player)
                      }
                      className="w-4 h-4 text-stone-600 border-stone-300 focus:ring-stone-500"
                    />
                    <span className="text-stone-700 zen-text group-hover:text-stone-900 transition-colors">
                      {player.label}
                    </span>
                    <div
                      className={`w-3 h-3 rounded-full ${player.color}`}
                    ></div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* AI vs AI - Both players are AI */}
          {selectedMode === "ai_vs_ai" && (
            <div className="card bg-stone-100/50 p-4">
              <p className="text-sm text-stone-700 zen-text text-center">
                {content.bothPlayers} AI
              </p>
            </div>
          )}
        </div>

        <div className="card-footer flex space-x-4">
          <button
            onClick={onCancel}
            className="btn btn-secondary flex-1"
          >
            {content.cancel}
          </button>
          <button
            onClick={handleStartGame}
            className="btn btn-primary flex-1"
          >
            {content.startGame}
          </button>
        </div>
      </div>
    </div>
  );
}
