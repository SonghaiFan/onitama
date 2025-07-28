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
        // Keep only last 5 entries
        return newHistory.slice(-5);
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
      thinking: "AI 思考中...",
      calculating: "計算最佳移動",
      score: "評分",
      nodes: "節點",
      depth: "深度",
      time: "時間",
      ms: "毫秒",
    },
    en: {
      thinking: "AI Thinking...",
      calculating: "Calculating best move",
      score: "Score",
      nodes: "Nodes",
      depth: "Depth",
      time: "Time",
      ms: "ms",
    },
  };

  if (!isThinking) return null;

  const latestThinking = thinkingHistory[thinkingHistory.length - 1];
  const displayTime = latestThinking?.elapsedTime || currentTime;

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Main thinking indicator */}
      <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
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

        {/* Real-time stats */}
        <div className="flex flex-col text-xs text-stone-600 ml-4">
          <div className="flex items-center space-x-2">
            <span>{content[language].time}:</span>
            <span className="font-mono">{Math.round(displayTime)}{content[language].ms}</span>
          </div>
          {latestThinking && (
            <>
              <div className="flex items-center space-x-2">
                <span>{content[language].score}:</span>
                <span className={`font-mono ${
                  Math.abs(latestThinking.score) >= 10000 
                    ? latestThinking.score > 0 
                      ? 'text-green-600 font-bold' 
                      : 'text-red-600 font-bold'
                    : 'text-stone-600'
                }`}>
                  {Math.abs(latestThinking.score) >= 10000 
                    ? (latestThinking.score > 0 ? '🏆 WIN' : '💀 LOSE')
                    : latestThinking.score.toFixed(1)
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>{content[language].nodes}:</span>
                <span className="font-mono">{latestThinking.nodesEvaluated.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Thinking history with fade effect */}
      {thinkingHistory.length > 1 && (
        <div className="space-y-1">
          {thinkingHistory
            .slice(0, -1)
            .reverse()
            .map((thinking, index) => {
              const opacity = Math.max(0.2, 1 - (index + 1) * 0.3);
              const age = Date.now() - thinking.timestamp;

              return (
                <div
                  key={thinking.timestamp}
                  className="flex items-center justify-between bg-white/60 backdrop-blur-sm rounded px-2 py-1 text-xs transition-opacity duration-500"
                  style={{ opacity }}
                >
                  <div className="flex space-x-3 text-stone-600">
                    <span>
                      {content[language].score}: {
                        Math.abs(thinking.score) >= 10000 
                          ? (thinking.score > 0 ? '🏆 WIN' : '💀 LOSE')
                          : thinking.score.toFixed(1)
                      }
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
                    -{Math.round(age)}ms
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AIThinkingIndicator;
