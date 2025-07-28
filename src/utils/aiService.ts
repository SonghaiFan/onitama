import { GameState, Player } from "@/types/game";
import { AIFactory } from "./ai/aiFactory";
import { AIMoveResult } from "./ai/algorithms/baseAI";

export type AIDifficulty = "easy" | "medium";

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
 * Now uses the new AI factory and algorithms
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

    // Use the new AI factory to get the best move
    const aiResult = await AIFactory.findBestMove(
      gameState,
      player,
      this.config.difficulty
    );

    // Simulate additional thinking time if needed
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < this.config.thinkingTime) {
      await this.simulateThinking(this.config.thinkingTime - elapsedTime);
    }

    return {
      from: aiResult.move.from,
      to: aiResult.move.to,
      cardIndex: aiResult.move.cardIndex,
      score: aiResult.score,
      thinkingTime: Date.now() - startTime,
    };
  }

  /**
   * Simulate AI thinking time
   */
  private async simulateThinking(time: number): Promise<void> {
    const variance = time * 0.3; // 30% variance
    const actualTime = time + (Math.random() - 0.5) * variance;

    await new Promise((resolve) => setTimeout(resolve, actualTime));
  }

  /**
   * Get AI difficulty description
   */
  static getDifficultyDescription(
    difficulty: AIDifficulty,
    language: "zh" | "en" = "en"
  ): string {
    return AIFactory.getDifficultyDescription(difficulty, language);
  }

  /**
   * Get AI algorithm details
   */
  static getAlgorithmDetails(difficulty: AIDifficulty) {
    return AIFactory.getAlgorithmDetails(difficulty);
  }

  /**
   * Get detailed AI move analysis (for debugging or advanced features)
   */
  async getDetailedAIMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    return await AIFactory.findBestMove(
      gameState,
      player,
      this.config.difficulty
    );
  }
}

// Default AI service instance
export const defaultAIService = new AIService();
