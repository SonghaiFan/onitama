import { GameState, Player } from "@/types/game";
import { AIFactory, AIAlgorithm } from "./ai/aiFactory";
import { AIMoveResult } from "./ai/algorithms/baseAI";

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
  private algorithm: AIAlgorithm;
  private thinkingTime: number;

  constructor(algorithm: AIAlgorithm = "medium", thinkingTime: number = 1000) {
    this.algorithm = algorithm;
    this.thinkingTime = thinkingTime;
  }

  /**
   * Set AI algorithm
   */
  setAlgorithm(algorithm: AIAlgorithm): void {
    this.algorithm = algorithm;
  }

  /**
   * Set thinking time
   */
  setThinkingTime(time: number): void {
    this.thinkingTime = time;
  }

  /**
   * Get AI move with thinking time simulation
   */
  async getAIMove(gameState: GameState, player: Player): Promise<AIMove> {
    const startTime = Date.now();

    const aiResult = await AIFactory.findBestMove(gameState, player, this.algorithm);

    // Simulate additional thinking time if needed
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < this.thinkingTime) {
      await this.simulateThinking(this.thinkingTime - elapsedTime);
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
   * Get detailed AI move analysis
   */
  async getDetailedAIMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    return await AIFactory.findBestMove(gameState, player, this.algorithm);
  }

  /**
   * Simulate AI thinking time
   */
  private async simulateThinking(time: number): Promise<void> {
    const variance = time * 0.3;
    const actualTime = time + (Math.random() - 0.5) * variance;
    await new Promise((resolve) => setTimeout(resolve, actualTime));
  }
}

// Default AI service instance
export const defaultAIService = new AIService();