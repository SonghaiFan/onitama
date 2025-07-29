import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

/**
 * Easy AI - basic strategy with limited tactical evaluation
 * Uses minimax with shallow depth for quick decision making
 */
export class EasyAI extends BaseAI {
  constructor() {
    super(4, 4000);
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

    // Use iterative deepening with minimax
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

    for (const move of moves) {
      if (this.isTimeUp()) break;

      const newGameState = this.simulateMove(gameState, move);
      const { score, nodesEvaluated } = this.minimax(newGameState, depth - 1);

      totalNodes += nodesEvaluated;

      const isImprovement =
        player === "red" ? score > bestScore : score < bestScore;

      if (isImprovement) {
        bestMove = move;
        bestScore = score;
      }
    }

    return {
      move: bestMove,
      score: bestScore,
      nodesEvaluated: totalNodes,
    };
  }
}
