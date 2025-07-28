import { GameState, Player } from "@/types/game";
import { AIDifficulty } from "@/utils/aiService";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import { MediumAI } from "./algorithms/mediumAI";
import { MCTSAI } from "./algorithms/mctsAI";
import { EnhancedAI } from "./algorithms/enhancedAI";

export class AIFactory {
  private static instances: Map<AIDifficulty, BaseAI> = new Map();

  /**
   * Get AI instance for the specified difficulty
   */
  static getAI(difficulty: AIDifficulty): BaseAI {
    if (!this.instances.has(difficulty)) {
      let ai: BaseAI;

      switch (difficulty) {
        case "easy":
          ai = new EasyAI();
          break;
        case "medium":
          ai = new MediumAI();
          break;
        case "mcts":
          ai = new MCTSAI(4, 5000);
          break;
        case "enhanced":
          ai = new EnhancedAI(4, 5000, true);
          break;
        default:
          ai = new EasyAI();
      }

      this.instances.set(difficulty, ai);
    }

    return this.instances.get(difficulty)!;
  }

  /**
   * Find best move using the specified AI difficulty
   */
  static async findBestMove(
    gameState: GameState,
    player: Player,
    difficulty: AIDifficulty
  ): Promise<AIMoveResult> {
    const ai = this.getAI(difficulty);
    return await ai.findBestMove(gameState, player);
  }

  /**
   * Clear all AI instances (useful for testing or memory management)
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
