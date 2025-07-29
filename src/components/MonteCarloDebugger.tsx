import  { useEffect } from "react";
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
  aiType?: "hybrid" | "hard" | "pure";
  guaranteedWin?: boolean;
  alphaBetaScores?: Array<{
    move: string;
    score: number;
  }>;
  batchProgress?: {
    batchNumber: number;
    totalSimulations: number;
    bestWinRate: number;
  };
  timeoutReached?: boolean;
}

export function MonteCarloDebugger() {
  useEffect(() => {
    // Subscribe to Monte Carlo specific updates
    const unsubscribeMonteCarlo = eventBus.subscribe<MonteCarloUpdateEvent>(
      "monte_carlo_update",
      (data) => {
        const aiTypeLabel = data.aiType ? `[${data.aiType.toUpperCase()}] ` : "";
        console.group(
          `🎲 ${aiTypeLabel}Monte Carlo Update - Phase: ${data.phase || "unknown"}`
        );
        
        if (data.guaranteedWin) {
          console.log(`🏆 GUARANTEED WIN FOUND!`);
        }
        
        console.log(`📊 Score: ${data.score.toFixed(1)}%`);
        console.log(
          `🧠 Nodes Evaluated: ${data.nodesEvaluated.toLocaleString()}`
        );
        console.log(`⏱️ Elapsed Time: ${data.elapsedTime}ms`);

        if (data.bestMoveFound) {
          const move = data.bestMoveFound;
          console.log(
            `🎯 Best Move: [${move.from.join(",")}] → [${move.to.join(
              ","
            )}] (Card: ${move.cardIndex})`
          );
        }

        if (data.alphaBetaScores && data.alphaBetaScores.length > 0) {
          console.group("📈 Alpha-Beta Scores:");
          data.alphaBetaScores.forEach((moveData) => {
            console.log(`  ${moveData.move}: ${moveData.score}`);
          });
          console.groupEnd();
        }

        if (data.moveWinRates && data.moveWinRates.length > 0) {
          console.group("📈 Move Win Rates:");
          data.moveWinRates.forEach((moveData) => {
            console.log(
              `  ${moveData.move}: ${moveData.winRate.toFixed(1)}% ` +
                `(${moveData.wins}W/${moveData.losses}L/${moveData.draws}D, ${moveData.simulations} sims)`
            );
          });
          console.groupEnd();
        }

        if (data.batchProgress) {
          console.log(
            `📊 Batch ${data.batchProgress.batchNumber}: ${data.batchProgress.totalSimulations.toLocaleString()} simulations, best win rate: ${data.batchProgress.bestWinRate.toFixed(1)}%`
          );
        }

        if (data.filteredMoves !== undefined && data.totalMoves !== undefined) {
          console.log(
            `🎯 Move Filtering: ${data.filteredMoves}/${data.totalMoves} moves after filtering`
          );
        }

        if (data.timeoutReached) {
          console.log(`⏰ Timeout reached`);
        }

        console.groupEnd();
      }
    );

    // Subscribe to general AI thinking updates
    const unsubscribeAI = eventBus.subscribe(
      "ai_thinking_update",
      (data: MonteCarloUpdateEvent) => {
        // Only log if it's not a Monte Carlo update (to avoid duplicates)
        if (!data.phase) {
          console.log(
            `🤖 AI Thinking: Score ${data.score?.toFixed(
              1
            )}%, Nodes: ${data.nodesEvaluated?.toLocaleString()}`
          );
        }
      }
    );

    return () => {
      unsubscribeMonteCarlo();
      unsubscribeAI();
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
