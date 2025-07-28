import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

export class ExpertAI extends BaseAI {
  constructor() {
    super(6, 10000); // Deepest search, slowest, for ExpertAI
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    const startTime = Date.now();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Always use full-depth minimax for expert level
    const result = this.findBestMoveWithMinimax(
      gameState,
      player,
      this.maxDepth
    );

    const thinkingTime = Date.now() - startTime;

    return {
      move: result.move,
      score: result.score,
      depth: this.maxDepth,
      nodesEvaluated: moves.length,
      thinkingTime,
    };
  }
}
