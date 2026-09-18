import { GameState, Player } from "@/types/game";
import { checkWinConditions } from "@/utils/gameManager";
import { AIFactory } from "./aiFactory";

export interface WinProbability {
  red: number; // Red win probability (0 to 100)
  blue: number; // Blue win probability (0 to 100)
  score: number; // Raw heuristic score from Red's perspective
  advantage: "red" | "blue" | "even";
}

/**
 * Converts a heuristic score (from Red's perspective) to win probabilities
 * Uses a logistic sigmoid function P = 1 / (1 + exp(-score / C))
 * C = 300 gives an intuitive, chess-engine style curve:
 * - 0 pts: 50.0% / 50.0% (Even)
 * - +130 pts (~1 student): 60.7% / 39.3%
 * - +260 pts (~2 students): 70.4% / 29.6%
 * - +350 pts (Master 1-step from temple): 76.2% / 23.8%
 * - +600 pts (Decisive material & positional lead): 88.1% / 11.9%
 * - >= 900,000 pts (Terminal forced mate): 100.0% / 0.0%
 */
export function scoreToWinProbability(score: number): WinProbability {
  // Terminal win/loss check
  if (score >= 900000) {
    return { red: 100, blue: 0, score, advantage: "red" };
  }
  if (score <= -900000) {
    return { red: 0, blue: 100, score, advantage: "blue" };
  }

  const C = 300;
  // Standard logistic sigmoid
  const pRed = 1 / (1 + Math.exp(-score / C));
  const redPercent = Math.round(pRed * 1000) / 10;
  const bluePercent = Math.round((100 - redPercent) * 10) / 10;

  let advantage: "red" | "blue" | "even" = "even";
  if (redPercent >= 53) advantage = "red";
  else if (bluePercent >= 53) advantage = "blue";

  return {
    red: redPercent,
    blue: bluePercent,
    score,
    advantage,
  };
}

/**
 * Evaluates the current board state and calculates the win probability.
 * - If an explicit search score is provided (e.g. from AI minimax), it converts that score.
 * - Otherwise, performs a static board evaluation using the Master AlphaBeta evaluator.
 */
export function calculateWinProbability(
  gameState: GameState,
  explicitScore?: number,
  scorePerspectivePlayer?: Player
): WinProbability {
  // 1. Check if game already has a winner
  const winner = gameState.winner || checkWinConditions(gameState);
  if (winner === "red") {
    return { red: 100, blue: 0, score: 1000000, advantage: "red" };
  }
  if (winner === "blue") {
    return { red: 0, blue: 100, score: -1000000, advantage: "blue" };
  }

  // 2. If an AI search score was supplied:
  if (explicitScore !== undefined && scorePerspectivePlayer) {
    // If AI evaluated from Blue's perspective, negate to get Red's perspective
    const redScore =
      scorePerspectivePlayer === "red" ? explicitScore : -explicitScore;
    return scoreToWinProbability(redScore);
  }

  // 3. Otherwise, statically evaluate the board position using Master AlphaBeta evaluator
  try {
    const masterAI = AIFactory.getAI("master-alphabeta");
    const boardScore = masterAI.evaluateBoard(gameState, "red", 0);
    return scoreToWinProbability(boardScore);
  } catch {
    // Fallback if AI factory cannot be reached
    return { red: 50, blue: 50, score: 0, advantage: "even" };
  }
}
