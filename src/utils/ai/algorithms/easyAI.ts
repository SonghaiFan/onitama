import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";

/**
 * Easy AI - basic strategy with limited tactical evaluation
 * Uses minimax with shallow depth for quick decision making
 */
export class EasyAI extends BaseAI {
  constructor() {
    super(2, 800);
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    return await this.searchWithIterativeDeepening(gameState, player, 2, 800);
  }
}
