// Main AI exports
export { AIFactory, type AIAlgorithm } from "./aiFactory";
export { BaseAI, type AIMoveResult } from "./algorithms/baseAI";

// Algorithm implementations (based on Rust agents)
export { EasyAI } from "./algorithms/easyAI";
export { MediumAI } from "./algorithms/mediumAI";
export { GreedyAI } from "./algorithms/greedyAI";
export { MinimaxAI } from "./algorithms/minimaxAI";
export { AlphaBetaAI } from "./algorithms/alphaBetaAI";
export { MonteCarloAI, HybridMonteCarloAI } from "./algorithms/monteCarloAI";

// Import types for use in utilities
import type { AIAlgorithm } from "./aiFactory";

// Utility functions
export const getAllAIAlgorithms = (): AIAlgorithm[] => [
  "easy",
  "medium",
  "greedy",
  "minimax",
  "alphabeta",
  "montecarlo",
  "hybrid",
];

export const getAIStrengthOrder = (): AIAlgorithm[] => [
  "easy",
  "greedy",
  "medium",
  "montecarlo",
  "minimax",
  "alphabeta",
  "hybrid",
];

/**
 * Compare AI algorithm strength
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export const compareAIStrength = (a: AIAlgorithm, b: AIAlgorithm): number => {
  const order = getAIStrengthOrder();
  const indexA = order.indexOf(a);
  const indexB = order.indexOf(b);

  if (indexA < indexB) return -1;
  if (indexA > indexB) return 1;
  return 0;
};

/**
 * Get AI algorithm by strength level (0 = weakest, 6 = strongest)
 */
export const getAIByStrength = (strength: number): AIAlgorithm => {
  const order = getAIStrengthOrder();
  const clampedStrength = Math.max(0, Math.min(strength, order.length - 1));
  return order[clampedStrength];
};

// Re-export types for convenience
export type { AIDifficulty } from "../aiService";
