import { GameState, Player } from "@/types/game";
import { AIDifficulty } from "@/utils/aiService";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import { MediumAI } from "./algorithms/mediumAI";
import { HardAI } from "./algorithms/hardAI";
import { ExpertAI } from "./algorithms/expertAI";

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
        case "hard":
          ai = new HardAI();
          break;
        case "expert":
          ai = new ExpertAI();
          break;
        default:
          ai = new MediumAI();
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
        hard: "困難 - 較強策略，很少隨機，適合有經驗的玩家",
        expert: "專家 - 最佳策略，無隨機，適合挑戰性對戰",
      },
      en: {
        easy: "Easy - Random moves, occasional captures, good for beginners",
        medium:
          "Medium - Basic strategy, moderate randomness, good for casual players",
        hard: "Hard - Strong strategy, minimal randomness, good for experienced players",
        expert: "Expert - Best strategy, no randomness, challenging gameplay",
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
      hard: {
        searchDepth: 4,
        searchAlgorithm: "Alpha-Beta pruning",
        evaluationMethod: "Sophisticated position evaluation",
        features: [
          "5% randomness",
          "Piece coordination",
          "King safety",
          "Card advantage",
          "Center control",
        ],
      },
      expert: {
        searchDepth: 8,
        searchAlgorithm: "Negamax with iterative deepening",
        evaluationMethod: "Advanced strategic evaluation with quiescence",
        features: [
          "No randomness",
          "Transposition table with Zobrist hashing",
          "MVV-LVA move ordering",
          "Quiescence search",
          "History heuristics",
          "Card advantage evaluation",
          "Mobility evaluation",
          "King safety evaluation",
          "Pawn structure evaluation",
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
