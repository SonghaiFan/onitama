import { GameState, Player } from "@/types/game";
import { AIDifficulty } from "@/utils/aiService";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import { MediumAI } from "./algorithms/mediumAI";

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

  /**
   * Get AI difficulty description
   */
  static getDifficultyDescription(
    difficulty: AIDifficulty,
    language: "zh" | "en" = "en"
  ): string {
    const descriptions = {
      en: {
        easy: "Simple random moves with basic strategy",
        medium: "Balanced strategy with tactical evaluation",
      },
      zh: {
        easy: "簡單隨機移動和基礎策略",
        medium: "平衡策略與戰術評估",
      },
    };

    return descriptions[language][difficulty];
  }

  /**
   * Get AI algorithm details
   */
  static getAlgorithmDetails(difficulty: AIDifficulty) {
    const details = {
      easy: {
        name: "Easy AI",
        description: "Basic random strategy",
        features: ["Random move selection", "Basic piece safety"],
        complexity: "Low",
        thinkingTime: "Fast",
      },
      medium: {
        name: "Medium AI",
        description: "Tactical evaluation",
        features: ["Position evaluation", "Tactical planning", "Threat detection"],
        complexity: "Medium",
        thinkingTime: "Moderate",
      },
    };

    return details[difficulty];
  }
}
