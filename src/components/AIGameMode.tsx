"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameState, Player } from "@/types/game";
import { AIDifficulty, defaultAIService } from "@/utils/aiService";
import { executeMove } from "@/utils/gameManager";
import AISettings from "./ui/AISettings";
import AIThinkingIndicator from "./ui/AIThinkingIndicator";
import { getPlayerColors } from "@/utils/gameAestheticConfig";

interface AIGameModeProps {
  gameState: GameState;
  onGameStateChange: (newState: GameState) => void;
  language: "zh" | "en";
  className?: string;
}

const AIGameMode: React.FC<AIGameModeProps> = ({
  gameState,
  onGameStateChange,
  language,
  className = "",
}) => {
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>("medium");
  const [aiPlayer, setAiPlayer] = useState<Player | null>(null);
  const [isAITurn, setIsAITurn] = useState(false);

  const content = {
    zh: {
      title: "AI 遊戲模式",
      vsAI: "對戰 AI",
      vsHuman: "雙人遊戲",
      redAI: "紅方 AI",
      blueAI: "藍方 AI",
      bothAI: "AI 對戰",
      human: "人類",
      ai: "AI",
      thinking: "AI 思考中...",
    },
    en: {
      title: "AI Game Mode",
      vsAI: "vs AI",
      vsHuman: "2 Players",
      redAI: "Red AI",
      blueAI: "Blue AI",
      bothAI: "AI vs AI",
      human: "Human",
      ai: "AI",
      thinking: "AI Thinking...",
    },
  };

  // Configure AI service when difficulty changes
  useEffect(() => {
    defaultAIService.setConfig({ difficulty: aiDifficulty });
  }, [aiDifficulty]);

  // Handle AI turns
  useEffect(() => {
    if (
      aiPlayer &&
      gameState.currentPlayer === aiPlayer &&
      !gameState.winner &&
      !isAITurn &&
      gameState.gamePhase === "playing"
    ) {
      handleAITurn();
    }
  }, [
    gameState.currentPlayer,
    aiPlayer,
    gameState.winner,
    isAITurn,
    gameState.gamePhase,
  ]);

  const handleAITurn = useCallback(async () => {
    if (!aiPlayer || gameState.winner || gameState.gamePhase !== "playing")
      return;

    setIsAITurn(true);

    try {
      const aiMove = await defaultAIService.getAIMove(gameState, aiPlayer);

      // Execute the AI move
      const newGameState = executeMove(
        gameState,
        aiMove.from,
        aiMove.to,
        aiMove.cardIndex
      );

      onGameStateChange(newGameState);
    } catch (error) {
      console.error("AI move failed:", error);
    } finally {
      setIsAITurn(false);
    }
  }, [gameState, aiPlayer, onGameStateChange]);

  const setGameMode = useCallback(
    (mode: "human" | "ai", player: Player) => {
      if (mode === "ai") {
        setAiPlayer(player);
      } else {
        if (aiPlayer === player) {
          setAiPlayer(null);
        }
      }
    },
    [aiPlayer]
  );

  const getPlayerMode = (player: Player) => {
    return aiPlayer === player ? "ai" : "human";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI Settings */}
      <AISettings
        difficulty={aiDifficulty}
        onDifficultyChange={setAiDifficulty}
        language={language}
      />

      {/* Game Mode Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-stone-700 zen-text">
          {content[language].title}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* Red Player */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  getPlayerColors("red").tailwind.shadow
                }`}
                style={{
                  backgroundColor: getPlayerColors("red").cssVar.primary,
                }}
              />
              <span className="text-sm font-medium text-stone-700 zen-text">
                {content[language].redAI}
              </span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setGameMode("human", "red")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  getPlayerMode("red") === "human"
                    ? "border-stone-600 bg-stone-100 text-stone-800"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {content[language].human}
              </button>
              <button
                onClick={() => setGameMode("ai", "red")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  getPlayerMode("red") === "ai"
                    ? "border-stone-600 bg-stone-100 text-stone-800"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {content[language].ai}
              </button>
            </div>
          </div>

          {/* Blue Player */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  getPlayerColors("blue").tailwind.shadow
                }`}
                style={{
                  backgroundColor: getPlayerColors("blue").cssVar.primary,
                }}
              />
              <span className="text-sm font-medium text-stone-700 zen-text">
                {content[language].blueAI}
              </span>
            </div>

            <div className="flex space-x-1">
              <button
                onClick={() => setGameMode("human", "blue")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  getPlayerMode("blue") === "human"
                    ? "border-stone-600 bg-stone-100 text-stone-800"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {content[language].human}
              </button>
              <button
                onClick={() => setGameMode("ai", "blue")}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  getPlayerMode("blue") === "ai"
                    ? "border-stone-600 bg-stone-100 text-stone-800"
                    : "border-stone-300 bg-white text-stone-600 hover:border-stone-400"
                }`}
              >
                {content[language].ai}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Thinking Indicator */}
      {isAITurn && aiPlayer && (
        <AIThinkingIndicator
          isThinking={isAITurn}
          player={aiPlayer}
          language={language}
          className="mt-4"
        />
      )}
    </div>
  );
};

export default AIGameMode;
