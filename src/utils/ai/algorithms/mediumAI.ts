import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";

export class MediumAI extends BaseAI {
  constructor() {
    super(2, 2000); // Medium: moderate depth and time
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Emit initial thinking update
    this.emitThinkingUpdate({
      depth: 0,
      nodesEvaluated: 0,
    });

    // Always use minimax with medium depth for MediumAI
    const result = this.findBestMoveWithMinimax(
      gameState,
      player,
      this.maxDepth
    );

    const thinkingTime = Date.now() - this.startTime;

    // Emit final thinking update
    this.emitThinkingUpdate({
      score: result.score,
      depth: this.maxDepth,
      nodesEvaluated: result.nodesEvaluated,
      bestMoveFound: {
        from: result.move.from,
        to: result.move.to,
        cardIndex: result.move.cardIndex,
      },
    });

    return {
      move: result.move,
      score: result.score,
      depth: this.maxDepth,
      nodesEvaluated: moves.length,
      thinkingTime,
    };
  }
}
