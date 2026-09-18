import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";

/**
 * Master Alpha-Beta AI
 * State-of-the-art Onitama engine utilizing Transposition Table,
 * Move Ordering, Quiescence Search, and Iterative Deepening Negamax.
 */
export class AlphaBetaAI extends BaseAI {
  constructor(maxDepth: number = 6, maxTime: number = 2000) {
    super(maxDepth, maxTime);
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    return await this.searchWithIterativeDeepening(
      gameState,
      player,
      this.maxDepth,
      this.maxTime
    );
  }
}
