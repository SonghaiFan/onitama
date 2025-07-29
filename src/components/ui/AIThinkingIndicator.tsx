import React, { useState, useEffect } from "react";
import { eventBus } from "@/utils/eventBus";

interface MonteCarloUpdateEvent {
  score: number;
  nodesEvaluated: number;
  depth: number;
  elapsedTime: number;
  bestMoveFound?: {
    from: [number, number];
    to: [number, number];
    cardIndex: number;
  };
  moveWinRates?: Array<{
    move: string;
    winRate: number;
    simulations: number;
    wins: number;
    losses: number;
    draws: number;
  }>;
  phase?: "alpha-beta" | "monte-carlo" | "decision";
  filteredMoves?: number;
  totalMoves?: number;
}

interface AIThinkingIndicatorProps {
  language: "zh" | "en";
}

const content = {
  zh: {
    aiThinking: "AI 思考中...",
    phase: {
      "alpha-beta": "戰術分析",
      "monte-carlo": "策略分析",
      decision: "決策中",
    },
    winRate: "勝率",
    simulations: "模擬次數",
    bestMove: "最佳移動",
    moveAnalysis: "移動分析",
  },
  en: {
    aiThinking: "AI Thinking...",
    phase: {
      "alpha-beta": "Tactical Analysis",
      "monte-carlo": "Strategic Analysis",
      decision: "Decision Making",
    },
    winRate: "Win Rate",
    simulations: "Simulations",
    bestMove: "Best Move",
    moveAnalysis: "Move Analysis",
  },
};

export function AIThinkingIndicator({ language }: AIThinkingIndicatorProps) {
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingData, setThinkingData] =
    useState<MonteCarloUpdateEvent | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const t = content[language];

  useEffect(() => {
    // Subscribe to Monte Carlo updates
    const unsubscribeMonteCarlo = eventBus.subscribe<MonteCarloUpdateEvent>(
      "monte_carlo_update",
      (data) => {
        setIsThinking(true);
        setThinkingData(data);

        // Add to logs
        const logEntry = `[${
          data.phase || "unknown"
        }] Score: ${data.score.toFixed(
          1
        )}%, Nodes: ${data.nodesEvaluated.toLocaleString()}`;
        setLogs((prev) => [...prev.slice(-9), logEntry]); // Keep last 10 entries
      }
    );

    // Subscribe to AI thinking start/end
    const unsubscribeAIStart = eventBus.subscribe("ai_thinking_start", () => {
      setIsThinking(true);
      setLogs([]);
    });

    const unsubscribeAIEnd = eventBus.subscribe("ai_thinking_end", () => {
      setIsThinking(false);
      setThinkingData(null);
    });

    return () => {
      unsubscribeMonteCarlo();
      unsubscribeAIStart();
      unsubscribeAIEnd();
    };
  }, []);

  if (!isThinking) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            {t.aiThinking}
          </span>
        </div>

        {/* Current Phase */}
        {thinkingData?.phase && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">
              {t.phase[thinkingData.phase as keyof typeof t.phase] ||
                thinkingData.phase}
            </div>
            <div className="text-sm font-medium text-gray-800">
              {thinkingData.score.toFixed(1)}% {t.winRate}
            </div>
          </div>
        )}

        {/* Progress Info */}
        {thinkingData && (
          <div className="mb-3 space-y-1">
            <div className="text-xs text-gray-600">
              {thinkingData.nodesEvaluated.toLocaleString()} {t.simulations}
            </div>
            {thinkingData.filteredMoves && thinkingData.totalMoves && (
              <div className="text-xs text-gray-600">
                {thinkingData.filteredMoves}/{thinkingData.totalMoves} moves
              </div>
            )}
          </div>
        )}

        {/* Best Move */}
        {thinkingData?.bestMoveFound && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">{t.bestMove}</div>
            <div className="text-sm font-mono text-gray-800">
              [{thinkingData.bestMoveFound.from.join(",")}] → [
              {thinkingData.bestMoveFound.to.join(",")}]
            </div>
          </div>
        )}

        {/* Move Win Rates */}
        {thinkingData?.moveWinRates && thinkingData.moveWinRates.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-2">{t.moveAnalysis}</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {thinkingData.moveWinRates.map((moveData, index) => (
                <div key={index} className="text-xs">
                  <div className="flex justify-between">
                    <span className="font-mono text-gray-700 truncate">
                      {moveData.move}
                    </span>
                    <span className="font-medium text-gray-800">
                      {moveData.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {moveData.wins}W/{moveData.losses}L/{moveData.draws}D (
                    {moveData.simulations})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Logs */}
        {logs.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2">Recent Activity</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
