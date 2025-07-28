import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./simpleBaseAI";

/**
 * Greedy AI - matches Rust greedy.rs implementation
 * Uses 3-depth minimax with randomized move selection
 */
export class GreedyAI extends BaseAI {
  constructor() {
    super(3, 1500); // Fixed depth 3, moderate time limit
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const startTime = this.startTime;

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Shuffle moves for randomness (like Rust implementation)
    const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

    let bestMove = shuffledMoves[0];
    let bestScore = player === "red" ? -Infinity : Infinity;
    let totalNodesEvaluated = 0;

    // Evaluate each move using fixed depth 3 minimax
    for (const move of shuffledMoves) {
      const newGameState = this.applyMove(gameState, move);
      const { score, nodesEvaluated } = this.minimax(newGameState, 3, player);

      totalNodesEvaluated += nodesEvaluated;

      const isImprovement =
        player === "red" ? score > bestScore : score < bestScore;

      if (isImprovement) {
        bestMove = move;
        bestScore = score;
      }
    }

    const thinkingTime = Date.now() - startTime;

    return {
      move: bestMove,
      score: bestScore,
      depth: 3,
      nodesEvaluated: totalNodesEvaluated,
      thinkingTime,
    };
  }
}
