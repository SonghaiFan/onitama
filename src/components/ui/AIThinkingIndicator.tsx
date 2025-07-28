"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Reset current time when thinking stops (but keep history)
  useEffect(() => {
    if (!isThinking) {
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
      calculating: "分析棋局中...",
      evaluating: "評估位置",
      searching: "搜索最佳步法",
      finalizing: "確認移動",
      score: "評分",
      nodes: "節點",
      depth: "深度",
      time: "用時",
      ms: "ms",
      strongPosition: "優勢局面",
      weakPosition: "劣勢局面",
      evenPosition: "均勢",
      findingWin: "發現勝機!",
      avoidingLoss: "化解危機",
      recentThoughts: "思考歷程",
    },
    en: {
      thinking: "AI Thinking",
      calculating: "Analyzing position...",
      evaluating: "Evaluating moves",
      searching: "Searching best play",
      finalizing: "Finalizing move",
      score: "Score",
      nodes: "Nodes",
      depth: "Depth", 
      time: "Time",
      ms: "ms",
      strongPosition: "Strong position",
      weakPosition: "Weak position",
      evenPosition: "Even game",
      findingWin: "Finding win!",
      avoidingLoss: "Avoiding loss",
      recentThoughts: "Recent Thoughts",
    },
  };

  const latestThinking = thinkingHistory[thinkingHistory.length - 1];
  const displayTime = latestThinking?.elapsedTime || currentTime;
  const playerColors = getPlayerColors(player);

  // Helper functions for more intuitive display
  const getThinkingStage = (time: number): string => {
    if (time < 1000) return content[language].evaluating;
    if (time < 2000) return content[language].searching;  
    if (time < 3000) return content[language].calculating;
    return content[language].finalizing;
  };

  const getPositionStrength = (score: number): { text: string; color: string; intensity: string } => {
    if (Math.abs(score) >= 1000000) {
      return score > 0 
        ? { text: content[language].findingWin, color: "text-emerald-600", intensity: "font-bold" }
        : { text: content[language].avoidingLoss, color: "text-red-600", intensity: "font-bold" };
    }
    if (Math.abs(score) > 50) {
      return score > 0
        ? { text: content[language].strongPosition, color: "text-emerald-500", intensity: "font-medium" }
        : { text: content[language].weakPosition, color: "text-red-500", intensity: "font-medium" };
    }
    return { text: content[language].evenPosition, color: "text-stone-600", intensity: "font-normal" };
  };

  const getBrainIntensity = (nodes: number): string => {
    if (nodes > 10000) return "animate-pulse";
    if (nodes > 5000) return "animate-bounce";
    return "";
  };

  // If not thinking and no history, don't show anything
  if (!isThinking && thinkingHistory.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <div className={`flex flex-col space-y-3 ${className}`}>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="zen-card border border-stone-300 shadow-lg overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100"
          >
            <div className="flex items-center space-x-4 p-4">
              {/* Brain icon with dynamic animation */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className={`w-8 h-8 rounded-full border-2 ${playerColors.tailwind.text.replace("text-", "border-")} ${getBrainIntensity(latestThinking?.nodesEvaluated || 0)}`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className={`text-lg ${playerColors.tailwind.text}`}>🧠</span>
                  </div>
                </motion.div>
                
                {/* Thinking pulses */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full border-2 ${playerColors.tailwind.text.replace("text-", "border-")} opacity-20`}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <motion.h4
                      className={`text-sm font-medium zen-text ${playerColors.tailwind.text}`}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {content[language].thinking}
                    </motion.h4>
                    <motion.p 
                      key={getThinkingStage(displayTime)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-stone-600 zen-text mt-0.5 font-medium"
                    >
                      {getThinkingStage(displayTime)}
                    </motion.p>
                  </div>

                  {/* Time display with pulse */}
                  <div className="text-right">
                    <div className="text-xs text-stone-400 zen-text">
                      {content[language].time}
                    </div>
                    <motion.div 
                      className="font-mono text-lg font-bold text-stone-700"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {(displayTime / 1000).toFixed(1)}s
                    </motion.div>
                  </div>
                </div>

                {/* Position evaluation with intuitive feedback */}
                {latestThinking && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 pt-3 border-t border-stone-200"
                  >
                    {/* Position strength indicator */}
                    <div className="mb-2">
                      <motion.span
                        key={latestThinking.score}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`text-sm zen-text ${getPositionStrength(latestThinking.score).color} ${getPositionStrength(latestThinking.score).intensity}`}
                      >
                        {getPositionStrength(latestThinking.score).text}
                      </motion.span>
                    </div>

                    {/* Stats with icons */}
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="text-stone-500">📊</span>
                        <span className="font-mono text-stone-700">
                          {Math.abs(latestThinking.score) >= 1000000 
                            ? (latestThinking.score > 0 ? "勝!" : "敗!") 
                            : latestThinking.score.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-stone-500">🔍</span>
                        <motion.span 
                          className="font-mono text-stone-700"
                          animate={latestThinking.nodesEvaluated > 10000 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          {latestThinking.nodesEvaluated.toLocaleString()}
                        </motion.span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-stone-500">⚡</span>
                        <span className="font-mono text-stone-700">
                          D{latestThinking.depth}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Thinking history with enhanced animations */}
        {((!isThinking && thinkingHistory.length > 0) ||
          (isThinking && thinkingHistory.length > 1)) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="text-xs text-stone-400 zen-text px-1 flex items-center">
              <span className="mr-1">💭</span>
              {content[language].recentThoughts}
            </div>
            <div className="space-y-1">
              <AnimatePresence>
                {(isThinking ? thinkingHistory.slice(0, -1) : thinkingHistory)
                  .slice()
                  .reverse()
                  .map((thinking, index) => {
                    const opacity = Math.max(0.4, 1 - index * 0.2);
                    const age = Date.now() - thinking.timestamp;
                    const strength = getPositionStrength(thinking.score);

                    return (
                      <motion.div
                        key={thinking.timestamp}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        className="zen-card border-stone-200 p-3 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center justify-between text-xs zen-text">
                          <div className="flex items-center space-x-3">
                            {/* Position indicator */}
                            <div className={`w-2 h-2 rounded-full ${strength.color.replace('text-', 'bg-')}`} />
                            
                            {/* Compact stats */}
                            <div className="flex space-x-3 text-stone-600">
                              <span className="flex items-center space-x-1">
                                <span>📊</span>
                                <span className="font-mono">
                                  {Math.abs(thinking.score) >= 1000000 
                                    ? (thinking.score > 0 ? "勝" : "敗") 
                                    : thinking.score.toFixed(1)}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>🔍</span>
                                <span className="font-mono">
                                  {thinking.nodesEvaluated > 1000 
                                    ? `${(thinking.nodesEvaluated / 1000).toFixed(1)}k`
                                    : thinking.nodesEvaluated}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <span>⚡</span>
                                <span className="font-mono">D{thinking.depth}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Age indicator */}
                          <span className="text-stone-400 font-mono text-xs">
                            -{(age / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default AIThinkingIndicator;
