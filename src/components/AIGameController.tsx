"use client";

import React, { useState, useEffect, useCallback } from "react";
import { GameState, Player } from "@/types/game";
import { executeMove } from "@/utils/gameManager";
import { aiManager, AIMove, AIConfig, AI_CONFIGS } from "@/utils/aiManager";

// Bilingual content for AI interface
const aiContent = {
  zh: {
    aiThinking: "AI思考中...",
    aiMove: "AI移動",
    difficulty: "難度",
    easy: "簡單",
    medium: "中等",
    hard: "困難",
    vsAI: "對戰AI",
    vsHuman: "對戰人類",
    aiPlayer: "AI玩家",
    humanPlayer: "人類玩家",
    thinkingTime: "思考時間",
    moveAnalysis: "移動分析",
    positionScore: "局面評分",
    bestMove: "最佳移動",
    alternativeMoves: "替代移動",
  },
  en: {
    aiThinking: "AI Thinking...",
    aiMove: "AI Move",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    vsAI: "vs AI",
    vsHuman: "vs Human",
    aiPlayer: "AI Player",
    humanPlayer: "Human Player",
    thinkingTime: "Thinking Time",
    moveAnalysis: "Move Analysis",
    positionScore: "Position Score",
    bestMove: "Best Move",
    alternativeMoves: "Alternative Moves",
  },
};

interface AIGameControllerProps {
  gameState: GameState;
  onGameStateChange: (newState: GameState) => void;
  aiPlayer: Player | null; // Which player is AI-controlled
  difficulty: "easy" | "medium" | "hard";
  language?: "zh" | "en";
  onAIMoveStart?: () => void;
  onAIMoveComplete?: (move: AIMove) => void;
}

export default function AIGameController({
  gameState,
  onGameStateChange,
  aiPlayer,
  difficulty,
  language = "zh",
  onAIMoveStart,
  onAIMoveComplete,
}: AIGameControllerProps) {
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastAIMove, setLastAIMove] = useState<AIMove | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    thinkingTime: number;
    alternatives: AIMove[];
  } | null>(null);

  const content = aiContent[language];

  // Check if it's AI's turn
  const isAITurn =
    aiPlayer && gameState.currentPlayer === aiPlayer && !gameState.winner;

  // AI move generation
  const generateAIMove = useCallback(async () => {
    if (!isAITurn || isAIThinking) return;

    setIsAIThinking(true);
    onAIMoveStart?.();

    const startTime = Date.now();

    try {
      const config: AIConfig = AI_CONFIGS[difficulty];
      const aiMove = await aiManager.generateMove(gameState, config);

      const thinkingTime = Date.now() - startTime;

      if (aiMove) {
        // Execute the AI move
        const newGameState = executeMove(
          gameState,
          aiMove.from,
          aiMove.to,
          aiMove.cardIndex
        );

        setLastAIMove(aiMove);
        setAiAnalysis({
          score: aiMove.score || 0,
          thinkingTime,
          alternatives: [], // Could be expanded to show alternative moves
        });

        onGameStateChange(newGameState);
        onAIMoveComplete?.(aiMove);
      }
    } catch (error) {
      console.error("AI move generation failed:", error);
    } finally {
      setIsAIThinking(false);
    }
  }, [
    gameState,
    aiPlayer,
    difficulty,
    isAITurn,
    isAIThinking,
    onGameStateChange,
    onAIMoveStart,
    onAIMoveComplete,
  ]);

  // Auto-trigger AI move when it's AI's turn
  useEffect(() => {
    if (isAITurn && !isAIThinking) {
      // Add a small delay to make AI moves feel more natural
      const timer = setTimeout(() => {
        generateAIMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAITurn, isAIThinking, generateAIMove]);

  // Evaluate current position
  const evaluatePosition = useCallback(() => {
    if (!aiPlayer) return null;

    const score = aiManager.evaluatePosition(gameState, aiPlayer);
    return score;
  }, [gameState, aiPlayer]);

  // Don't render anything if no AI player
  if (!aiPlayer) return null;

  return (
    <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200 min-w-64">
      <div className="space-y-3">
        {/* AI Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {content.aiPlayer}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              aiPlayer === "red"
                ? "bg-red-100 text-red-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {aiPlayer === "red" ? "Red" : "Blue"}
          </span>
        </div>

        {/* Difficulty */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{content.difficulty}</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              difficulty === "easy"
                ? "bg-green-100 text-green-800"
                : difficulty === "medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {content[difficulty]}
          </span>
        </div>

        {/* AI Thinking Status */}
        {isAIThinking && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">{content.aiThinking}</span>
          </div>
        )}

        {/* Position Evaluation */}
        {!isAIThinking && (
          <div className="text-sm">
            <div className="text-gray-600">{content.positionScore}</div>
            <div className="font-mono text-lg">
              {evaluatePosition()?.toFixed(1) || "0.0"}
            </div>
          </div>
        )}

        {/* Last AI Move Analysis */}
        {lastAIMove && aiAnalysis && !isAIThinking && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              {content.moveAnalysis}
            </div>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>{content.bestMove}:</span>
                <span className="font-mono">
                  {String.fromCharCode(97 + lastAIMove.from[1])}
                  {5 - lastAIMove.from[0]} →
                  {String.fromCharCode(97 + lastAIMove.to[1])}
                  {5 - lastAIMove.to[0]}
                </span>
              </div>

              <div className="flex justify-between">
                <span>{content.thinkingTime}:</span>
                <span>{aiAnalysis.thinkingTime}ms</span>
              </div>

              <div className="flex justify-between">
                <span>Score:</span>
                <span className="font-mono">{aiAnalysis.score.toFixed(1)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
