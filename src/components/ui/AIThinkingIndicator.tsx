"use client";

import React, { useState, useEffect } from "react";
import { getPlayerColors } from "@/utils/gameAestheticConfig";
import { Player } from "@/types/game";

export interface ThinkingData {
  score: number;
  nodesEvaluated: number;
  depth: number;
  elapsedTime: number;
  timestamp: number;
}

interface AIThinkingIndicatorProps {
  isThinking: boolean;
  player: Player;
  language: "zh" | "en";
  thinkingData?: ThinkingData;
  className?: string;
}

const AIThinkingIndicator: React.FC<AIThinkingIndicatorProps> = ({
  isThinking,
  player,
  language,
  thinkingData,
  className = "",
}) => {
  const [thinkingHistory, setThinkingHistory] = useState<ThinkingData[]>([]);
  const [currentTime, setCurrentTime] = useState(0);

  // Update thinking history when new data arrives
  useEffect(() => {
    if (thinkingData && isThinking) {
      setThinkingHistory((prev) => {
        const newHistory = [
          ...prev,
          { ...thinkingData, timestamp: Date.now() },
        ];
        // Keep only last 3 entries for cleaner display
        return newHistory.slice(-3);
      });
    }
  }, [thinkingData, isThinking]);

  // Clear history when thinking stops
  useEffect(() => {
    if (!isThinking) {
      setThinkingHistory([]);
      setCurrentTime(0);
    }
  }, [isThinking]);

  // Update current time for real-time display
  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => prev + 100);
    }, 100);

    return () => clearInterval(interval);
  }, [isThinking]);
  const content = {
    zh: {
      thinking: "AI 思考中",
      calculating: "計算最佳移動",
      score: "評分",
      nodes: "節點",
      depth: "深度",
      time: "時間",
      ms: "ms",
      recentThoughts: "思考歷程",
    },
    en: {
      thinking: "AI Thinking",
      calculating: "Calculating best move",
      score: "Score",
      nodes: "Nodes",
      depth: "Depth",
      time: "Time",
      ms: "ms",
      recentThoughts: "Recent Thoughts",
    },
  };

  if (!isThinking) return null;

  const latestThinking = thinkingHistory[thinkingHistory.length - 1];
  const displayTime = latestThinking?.elapsedTime || currentTime;
  const playerColors = getPlayerColors(player);

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      {/* Main thinking indicator with zen card styling */}
      <div className="zen-card border border-stone-300 shadow-lg overflow-hidden">
        <div className="flex items-center space-x-4 p-4">
          {/* Animated thinking dots */}
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ai-thinking-dot ${playerColors.tailwind.text.replace(
                  "text-",
                  "bg-"
                )}`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className={`text-sm font-medium zen-text ${playerColors.tailwind.text}`}
                >
                  {content[language].thinking}
                </h4>
                <p className="text-xs text-stone-500 zen-text mt-0.5">
                  {content[language].calculating}
                </p>
              </div>

              {/* Time display */}
              <div className="text-right">
                <div className="text-xs text-stone-400 zen-text">
                  {content[language].time}
                </div>
                <div className="font-mono text-sm text-stone-700">
                  {(displayTime / 1000).toFixed(1)}s
                </div>
              </div>
            </div>

            {/* Stats row */}
            {latestThinking && (
              <div className="flex items-center space-x-6 mt-3 pt-3 border-t border-stone-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-500 zen-text">
                    {content[language].score}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium ${
                      Math.abs(latestThinking.score) >= 10000
                        ? latestThinking.score > 0
                          ? "text-emerald-600"
                          : "text-red-600"
                        : "text-stone-700"
                    }`}
                  >
                    {Math.abs(latestThinking.score) >= 10000
                      ? latestThinking.score > 0
                        ? "勝利"
                        : "敗北"
                      : latestThinking.score.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-500 zen-text">
                    {content[language].nodes}
                  </span>
                  <span className="font-mono text-xs text-stone-700">
                    {latestThinking.nodesEvaluated.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-500 zen-text">
                    {content[language].depth}
                  </span>
                  <span className="font-mono text-xs text-stone-700">
                    {latestThinking.depth}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thinking history with subtle zen styling */}
      {thinkingHistory.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs text-stone-400 zen-text px-1">
            {content[language].recentThoughts}
          </div>
          <div className="space-y-1">
            {thinkingHistory
              .slice(0, -1)
              .reverse()
              .map((thinking, index) => {
                const opacity = Math.max(0.4, 1 - (index + 1) * 0.2);
                const age = Date.now() - thinking.timestamp;

                return (
                  <div
                    key={thinking.timestamp}
                    className="zen-card border-stone-200 transition-opacity duration-500 p-3"
                    style={{ opacity }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex space-x-4 text-stone-600 zen-text">
                        <span>
                          {content[language].score}:{" "}
                          {Math.abs(thinking.score) >= 10000
                            ? thinking.score > 0
                              ? "勝"
                              : "敗"
                            : thinking.score.toFixed(1)}
                        </span>
                        <span>
                          {content[language].nodes}:{" "}
                          {thinking.nodesEvaluated.toLocaleString()}
                        </span>
                        <span>
                          {content[language].depth}: {thinking.depth}
                        </span>
                      </div>
                      <span className="text-stone-400 font-mono">
                        -{(age / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIThinkingIndicator;
