import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

export class EasyAI extends BaseAI {
  constructor() {
    super(1, 1000); // Very shallow search, quick thinking
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
      depth: 1,
      nodesEvaluated: 0,
    });

    let selectedMove: MoveWithMetadata;
    let score: number;

    // 70% chance to use simple capture logic, 30% use minimax
    if (Math.random() < 0.7) {
      // Simple strategy: prefer captures
      const captures = moves.filter((move) => move.isCapture);

      if (captures.length > 0) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      }

      score = this.evaluateState(gameState, player);
      
      // Emit mid-thinking update
      this.emitThinkingUpdate({
        score,
        depth: 1,
        nodesEvaluated: Math.floor(moves.length / 2),
        bestMoveFound: {
          from: selectedMove.from,
          to: selectedMove.to,
          cardIndex: selectedMove.cardIndex,
        },
      });
    } else {
      // Use minimax with depth 1
      const result = this.findBestMoveWithMinimax(gameState, player, 1);
      selectedMove = result.move;
      score = result.score;
    }

    const thinkingTime = Date.now() - this.startTime;

    // Emit final thinking update
    this.emitThinkingUpdate({
      score,
      depth: 1,
      nodesEvaluated: moves.length,
      bestMoveFound: {
        from: selectedMove.from,
        to: selectedMove.to,
        cardIndex: selectedMove.cardIndex,
      },
    });

    return {
      move: selectedMove,
      score,
      depth: 1,
      nodesEvaluated: moves.length,
      thinkingTime,
    };
  }
}
