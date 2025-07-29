import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import {
  HybridMonteCarloAI,
  PureMonteCarloAI,
  HardMonteCarloAI,
} from "./algorithms/monteCarloAI";

export type AIAlgorithm =
  | "hybrid-montecarlo"
  | "hard-montecarlo"
  | "pure-montecarlo"
  | "easy";

export class AIFactory {
  private static instances: Map<AIAlgorithm, BaseAI> = new Map();

  /**
   * Get AI instance for the specified algorithm
   */
  static getAI(algorithm: AIAlgorithm): BaseAI {
    if (!this.instances.has(algorithm)) {
      let ai: BaseAI;

      switch (algorithm) {
        case "easy":
          ai = new EasyAI();
          break;
        case "hybrid-montecarlo":
          ai = new HybridMonteCarloAI();
          break;
        case "hard-montecarlo":
          ai = new HardMonteCarloAI();
          break;
        case "pure-montecarlo":
          ai = new PureMonteCarloAI();
          break;
        default:
          ai = new EasyAI();
      }

      this.instances.set(algorithm, ai);
    }

    return this.instances.get(algorithm)!;
  }

  /**
   * Find best move using the specified AI algorithm
   */
  static async findBestMove(
    gameState: GameState,
    player: Player,
    algorithm: AIAlgorithm
  ): Promise<AIMoveResult> {
    const ai = this.getAI(algorithm);
    return await ai.findBestMove(gameState, player);
  }

  /**
   * Clear all AI instances (useful for testing or memory management)
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
