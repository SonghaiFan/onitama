import { GameState, Player } from "@/types/game";
import {
  getBestMove,
  getAllPlayerMoves,
  evaluateGameState,
} from "./gameManager";

export type AIDifficulty = "easy" | "medium" | "hard" | "expert";

export interface AIConfig {
  difficulty: AIDifficulty;
  thinkingTime: number; // milliseconds
  randomness: number; // 0-1, higher = more random moves
}

export interface AIMove {
  from: [number, number];
  to: [number, number];
  cardIndex: number;
  score: number;
  thinkingTime: number;
}

/**
 * AI Service for Onitama game
 */
export class AIService {
  private config: AIConfig;

  constructor(
    config: AIConfig = {
      difficulty: "medium",
      thinkingTime: 1000,
      randomness: 0.2,
    }
  ) {
    this.config = config;
  }

  /**
   * Set AI configuration
   */
  setConfig(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get AI move with thinking time simulation
   */
  async getAIMove(gameState: GameState, player: Player): Promise<AIMove> {
    const startTime = Date.now();

    // Simulate thinking time
    await this.simulateThinking();

    const allMoves = getAllPlayerMoves(gameState, player);
    if (allMoves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    let selectedMove: (typeof allMoves)[0];

    // Apply difficulty-based selection
    switch (this.config.difficulty) {
      case "easy":
        selectedMove = this.selectEasyMove(allMoves);
        break;
      case "medium":
        selectedMove = this.selectMediumMove(allMoves, gameState, player);
        break;
      case "hard":
        selectedMove = this.selectHardMove(allMoves, gameState, player);
        break;
      case "expert":
        selectedMove = this.selectExpertMove(allMoves, gameState, player);
        break;
      default:
        selectedMove = this.selectMediumMove(allMoves, gameState, player);
    }

    const thinkingTime = Date.now() - startTime;
    const score = evaluateGameState(gameState, player);

    return {
      from: selectedMove.from,
      to: selectedMove.to,
      cardIndex: selectedMove.cardIndex,
      score,
      thinkingTime,
    };
  }

  /**
   * Easy AI: Mostly random moves with basic capture preference
   */
  private selectEasyMove(
    moves: ReturnType<typeof getAllPlayerMoves>
  ): (typeof moves)[0] {
    // Prefer captures if available
    const captures = moves.filter((move) => move.isCapture);
    if (captures.length > 0 && Math.random() > this.config.randomness) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    // Otherwise random
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Medium AI: Basic evaluation with some randomness
   */
  private selectMediumMove(
    moves: ReturnType<typeof getAllPlayerMoves>,
    gameState: GameState,
    player: Player
  ): (typeof moves)[0] {
    // Add some randomness
    if (Math.random() < this.config.randomness) {
      return this.selectEasyMove(moves);
    }

    // Basic evaluation
    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
      // Simple scoring based on move properties
      let score = 0;

      if (move.isCapture) score += 10;
      if (move.isMasterMove) score += 5;
      if (move.distanceToGoal && move.distanceToGoal < 3) score += 8;

      // Add some randomness to avoid being too predictable
      score += (Math.random() - 0.5) * 5;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Hard AI: Uses proper evaluation with minimal randomness
   */
  private selectHardMove(
    moves: ReturnType<typeof getAllPlayerMoves>,
    gameState: GameState,
    player: Player
  ): (typeof moves)[0] {
    // Add minimal randomness
    if (Math.random() < this.config.randomness * 0.5) {
      return this.selectMediumMove(moves, gameState, player);
    }

    return getBestMove(gameState, player) || moves[0];
  }

  /**
   * Expert AI: Uses best move with no randomness
   */
  private selectExpertMove(
    moves: ReturnType<typeof getAllPlayerMoves>,
    gameState: GameState,
    player: Player
  ): (typeof moves)[0] {
    return getBestMove(gameState, player) || moves[0];
  }

  /**
   * Simulate AI thinking time
   */
  private async simulateThinking(): Promise<void> {
    const baseTime = this.config.thinkingTime;
    const variance = baseTime * 0.3; // 30% variance
    const actualTime = baseTime + (Math.random() - 0.5) * variance;

    await new Promise((resolve) => setTimeout(resolve, actualTime));
  }

  /**
   * Get AI difficulty description
   */
  static getDifficultyDescription(
    difficulty: AIDifficulty,
    language: "zh" | "en" = "en"
  ): string {
    const descriptions = {
      zh: {
        easy: "簡單 - 隨機移動，偶爾捕捉",
        medium: "中等 - 基本策略，適度隨機",
        hard: "困難 - 較強策略，很少隨機",
        expert: "專家 - 最佳策略，無隨機",
      },
      en: {
        easy: "Easy - Random moves, occasional captures",
        medium: "Medium - Basic strategy, moderate randomness",
        hard: "Hard - Strong strategy, minimal randomness",
        expert: "Expert - Best strategy, no randomness",
      },
    };

    return descriptions[language][difficulty];
  }
}

// Default AI service instance
export const defaultAIService = new AIService();
