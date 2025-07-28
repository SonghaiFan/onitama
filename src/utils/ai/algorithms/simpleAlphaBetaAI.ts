import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./simpleBaseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

/**
 * Alpha-Beta AI - matches Rust alphabeta.rs implementation
 * Uses iterative deepening with alpha-beta pruning for efficiency
 */
export class AlphaBetaAI extends BaseAI {
  constructor() {
    super(8, 4000); // Deeper search due to pruning efficiency
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

    // Use iterative deepening with alpha-beta
    const result = this.iterativeDeepening(gameState, player, (depth: number) =>
      this.findBestMoveAtDepth(gameState, player, depth)
    );

    if (!result) {
      // Fallback to first move
      return {
        move: moves[0],
        score: 0,
        depth: 1,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    const thinkingTime = Date.now() - startTime;

    return {
      move: result.move,
      score: result.score,
      depth: result.depth,
      nodesEvaluated: result.nodesEvaluated,
      thinkingTime,
    };
  }

  private findBestMoveAtDepth(
    gameState: GameState,
    player: Player,
    depth: number
  ): { move: MoveWithMetadata; score: number; nodesEvaluated: number } | null {
    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) return null;

    let bestMove = moves[0];
    let bestScore = player === "red" ? -Infinity : Infinity;
    let totalNodes = 0;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      if (this.isTimeUp()) break;

      const newGameState = this.applyMove(gameState, move);
      const { score, nodesEvaluated } = this.alphaBeta(
        newGameState,
        depth - 1,
        alpha,
        beta,
        player
      );

      totalNodes += nodesEvaluated;

      const isImprovement =
        player === "red" ? score > bestScore : score < bestScore;

      if (isImprovement) {
        bestMove = move;
        bestScore = score;

        // Update alpha-beta bounds at root level
        if (player === "red") {
          alpha = Math.max(alpha, bestScore);
        } else {
          beta = Math.min(beta, bestScore);
        }
      }
    }

    return {
      move: bestMove,
      score: bestScore,
      nodesEvaluated: totalNodes,
    };
  }
}
