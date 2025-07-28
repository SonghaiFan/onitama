import { GameState, Player } from "@/types/game";
import { AIDifficulty } from "@/utils/aiService";
import { BaseAI, AIMoveResult } from "./algorithms/baseAI";
import { EasyAI } from "./algorithms/easyAI";
import { MediumAI } from "./algorithms/mediumAI";
import { GreedyAI } from "./algorithms/greedyAI";
import { MinimaxAI } from "./algorithms/minimaxAI";
import { AlphaBetaAI } from "./algorithms/alphaBetaAI";
import { MonteCarloAI, HybridMonteCarloAI } from "./algorithms/monteCarloAI";

export type AIAlgorithm =
  | "easy"
  | "medium"
  | "greedy"
  | "minimax"
  | "alphabeta"
  | "montecarlo"
  | "hybrid";

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
        case "medium":
          ai = new MediumAI();
          break;
        case "greedy":
          ai = new GreedyAI();
          break;
        case "minimax":
          ai = new MinimaxAI();
          break;
        case "alphabeta":
          ai = new AlphaBetaAI();
          break;
        case "montecarlo":
          ai = new MonteCarloAI();
          break;
        case "hybrid":
          ai = new HybridMonteCarloAI();
          break;
        default:
          ai = new EasyAI();
      }

      this.instances.set(algorithm, ai);
    }

    return this.instances.get(algorithm)!;
  }

  /**
   * Map difficulty to algorithm (for backward compatibility)
   */
  static getAIFromDifficulty(difficulty: AIDifficulty): BaseAI {
    const algorithmMap: Record<AIDifficulty, AIAlgorithm> = {
      easy: "easy",
      medium: "alphabeta", // Use alpha-beta for medium difficulty
    };

    return this.getAI(algorithmMap[difficulty]);
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
   * Find best move using difficulty (for backward compatibility)
   */
  static async findBestMoveWithDifficulty(
    gameState: GameState,
    player: Player,
    difficulty: AIDifficulty
  ): Promise<AIMoveResult> {
    const ai = this.getAIFromDifficulty(difficulty);
    return await ai.findBestMove(gameState, player);
  }

  /**
   * Clear all AI instances (useful for testing or memory management)
   */
  static clearInstances(): void {
    this.instances.clear();
  }

  /**
   * Get algorithm description
   */
  static getAlgorithmDescription(
    algorithm: AIAlgorithm,
    language: "zh" | "en" = "en"
  ): string {
    const descriptions = {
      en: {
        easy: "Simple random moves with basic strategy",
        medium: "Balanced strategy with tactical evaluation",
        greedy: "Quick 3-move lookahead with randomized selection",
        minimax: "Classic minimax with iterative deepening",
        alphabeta: "Optimized minimax with alpha-beta pruning",
        montecarlo: "Statistical evaluation through random simulations",
        hybrid: "Combined alpha-beta analysis with Monte Carlo validation",
      },
      zh: {
        easy: "簡單隨機移動和基礎策略",
        medium: "平衡策略與戰術評估",
        greedy: "快速3步前瞻隨機選擇",
        minimax: "經典極小極大算法與迭代加深",
        alphabeta: "優化極小極大算法與α-β剪枝",
        montecarlo: "通過隨機模擬進行統計評估",
        hybrid: "結合α-β分析與蒙特卡羅驗證",
      },
    };

    return descriptions[language][algorithm];
  }

  /**
   * Get AI algorithm details
   */
  static getAlgorithmDetails(algorithm: AIAlgorithm) {
    const details = {
      easy: {
        name: "Easy AI",
        description: "Basic random strategy",
        features: ["Random move selection", "Basic piece safety"],
        complexity: "Low",
        thinkingTime: "Fast (~50ms)",
        strength: "★☆☆☆☆",
      },
      medium: {
        name: "Medium AI",
        description: "Tactical evaluation",
        features: [
          "Position evaluation",
          "Tactical planning",
          "Threat detection",
        ],
        complexity: "Medium",
        thinkingTime: "Moderate (~500ms)",
        strength: "★★☆☆☆",
      },
      greedy: {
        name: "Greedy AI",
        description: "Quick tactical moves",
        features: [
          "3-move lookahead",
          "Randomized selection",
          "Piece value evaluation",
        ],
        complexity: "Low-Medium",
        thinkingTime: "Fast (~200ms)",
        strength: "★★☆☆☆",
      },
      minimax: {
        name: "Minimax AI",
        description: "Classic game tree search",
        features: [
          "Iterative deepening",
          "Complete game tree exploration",
          "Optimal play",
        ],
        complexity: "Medium-High",
        thinkingTime: "Moderate (~1-3s)",
        strength: "★★★☆☆",
      },
      alphabeta: {
        name: "Alpha-Beta AI",
        description: "Optimized minimax search",
        features: ["Alpha-beta pruning", "Deeper search", "Move ordering"],
        complexity: "High",
        thinkingTime: "Moderate (~1-4s)",
        strength: "★★★★☆",
      },
      montecarlo: {
        name: "Monte Carlo AI",
        description: "Statistical simulation",
        features: [
          "Random game simulation",
          "Win rate analysis",
          "Robust evaluation",
        ],
        complexity: "Medium",
        thinkingTime: "Variable (~1-3s)",
        strength: "★★★☆☆",
      },
      hybrid: {
        name: "Hybrid AI",
        description: "Best of both worlds",
        features: [
          "Alpha-beta analysis",
          "Monte Carlo validation",
          "Move filtering",
        ],
        complexity: "Very High",
        thinkingTime: "Longer (~2-5s)",
        strength: "★★★★★",
      },
    };

    return details[algorithm];
  }

  /**
   * Get recommended algorithm based on game situation
   */
  static getRecommendedAlgorithm(
    gameState: GameState,
    timeConstraint: "fast" | "normal" | "slow" = "normal"
  ): AIAlgorithm {
    const movesCount = this.countTotalMoves(gameState);

    // Early game (lots of pieces) - use faster algorithms
    if (movesCount > 40) {
      switch (timeConstraint) {
        case "fast":
          return "greedy";
        case "normal":
          return "alphabeta";
        case "slow":
          return "hybrid";
      }
    }

    // Mid to late game - can afford more computation
    switch (timeConstraint) {
      case "fast":
        return "alphabeta";
      case "normal":
        return "hybrid";
      case "slow":
        return "hybrid";
    }
  }

  private static countTotalMoves(gameState: GameState): number {
    let moves = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (gameState.board[row][col]) moves++;
      }
    }
    return moves * 10; // Approximate moves available
  }
}
