import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";

export class EasyAI extends BaseAI {
  constructor() {
    super(1, 1000); // Very shallow search, quick thinking
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

    // Pure random selection
    const randomIndex = Math.floor(Math.random() * moves.length);
    const selectedMove = moves[randomIndex];
    const thinkingTime = Date.now() - startTime;

    return {
      move: selectedMove,
      score: 0,
      depth: 1,
      nodesEvaluated: moves.length,
      thinkingTime,
    };
  }
}
