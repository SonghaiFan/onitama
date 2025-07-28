import { GameState, Player } from "@/types/game";
import { AIDifficulty } from "@/utils/aiService";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import { MediumAI } from "./algorithms/mediumAI";
import { HardAI } from "./algorithms/hardAI";
import { ExpertAI } from "./algorithms/expertAI";
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
          ai = new EnhancedAI(4, 5000, true);
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
   * Get AI difficulty description
   */
  static getDifficultyDescription(
    difficulty: AIDifficulty,
    language: "zh" | "en" = "en"
  ): string {
    const descriptions = {
      zh: {
        easy: "簡單 - 隨機移動，偶爾捕捉，適合初學者",
        medium: "中等 - 基本策略，適度隨機，適合休閒玩家",
        mcts: "MCTS - 蒙特卡洛樹搜索，複雜局面處理能力強",
        enhanced: "增強 - 混合算法，自動選擇最佳策略",
      },
      en: {
        easy: "Easy - Random moves, occasional captures, good for beginners",
        medium:
          "Medium - Basic strategy, moderate randomness, good for casual players",
        mcts: "MCTS - Monte Carlo Tree Search, excels at complex positions",
        enhanced:
          "Enhanced - Hybrid algorithm, automatically selects best strategy",
      },
    };

    return descriptions[language][difficulty];
  }

  /**
   * Get AI algorithm details
   */
  static getAlgorithmDetails(difficulty: AIDifficulty): {
    searchDepth: number;
    searchAlgorithm: string;
    evaluationMethod: string;
    features: string[];
  } {
    const details = {
      easy: {
        searchDepth: 1,
        searchAlgorithm: "Random with capture preference",
        evaluationMethod: "Basic move scoring",
        features: [
          "70% capture preference",
          "Random selection",
          "Quick response",
        ],
      },
      medium: {
        searchDepth: 2,
        searchAlgorithm: "Basic evaluation",
        evaluationMethod: "Move-based scoring with randomness",
        features: [
          "20% randomness",
          "Capture evaluation",
          "Position evaluation",
          "Defensive moves",
        ],
      },

      mcts: {
        searchDepth: 4,
        searchAlgorithm: "Monte Carlo Tree Search",
        evaluationMethod: "Simulation-based evaluation",
        features: [
          "Inspired by jackadamson's implementation",
          "Adaptive exploration/exploitation",
          "Random playouts for evaluation",
          "Visit count-based move selection",
          "Handles complex positions well",
        ],
      },
      enhanced: {
        searchDepth: 4,
        searchAlgorithm: "Hybrid MCTS + Minimax",
        evaluationMethod: "Combined simulation and evaluation",
        features: [
          "Automatic algorithm selection",
          "MCTS for complex positions",
          "Minimax for simple positions",
          "Enhanced card evaluation",
          "Mobility assessment",
          "Best of both worlds",
        ],
      },
    };

    return details[difficulty];
  }

  /**
   * Clear all AI instances (useful for testing or memory management)
   */
  static clearInstances(): void {
    this.instances.clear();
  }
}
