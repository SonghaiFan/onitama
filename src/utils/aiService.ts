import { GameState, Player } from "@/types/game";
import { AIFactory, AIAlgorithm } from "./ai/aiFactory";
import { AIMoveResult } from "./ai/algorithms/baseAI";

export interface AIMove {
  from: [number, number];
  to: [number, number];
  cardIndex: number;
  score: number;
}

/**
 * AI Service for Onitama game
 */
export class AIService {
  private algorithm: AIAlgorithm;

  constructor(algorithm: AIAlgorithm = "hybrid-montecarlo") {
    this.algorithm = algorithm;
  }

  /**
   * Set AI algorithm
   */
  setAlgorithm(algorithm: AIAlgorithm): void {
    this.algorithm = algorithm;
  }

  /**
   * Get AI move with thinking time simulation (non-blocking)
   */
  async getAIMove(gameState: GameState, player: Player): Promise<AIMove> {
    // Yield control to the browser first to ensure smooth animations
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const aiResult = await AIFactory.findBestMove(
      gameState,
      player,
      this.algorithm
    );

    return {
      from: aiResult.move.from,
      to: aiResult.move.to,
      cardIndex: aiResult.move.cardIndex,
      score: aiResult.score,
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
}

// Default AI service instance
export const defaultAIService = new AIService();
