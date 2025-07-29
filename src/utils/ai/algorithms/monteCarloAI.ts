import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, checkWinConditions } from "@/utils/gameManager";

export class MonteCarloAI extends BaseAI {
  private readonly simulationsPerBatch = 50; // Check timeout every 50 simulations

  constructor() {
    super(0, 5000); // No depth limit, but time-limited
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

    if (moves.length === 1) {
      return {
        move: moves[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // Initialize results tracking for each move
    const moveResults: Array<{
      move: MoveWithMetadata;
      wins: number;
      losses: number;
      draws: number;
      simulations: number;
    }> = moves.map((move) => ({
      move,
      wins: 0,
      losses: 0,
      draws: 0,
      simulations: 0,
    }));

    let totalSimulations = 0;

    // Run Monte Carlo simulations until timeout
    while (Date.now() - startTime < this.maxTime) {
      for (const result of moveResults) {
        // Run batch of simulations for this move
        for (let i = 0; i < this.simulationsPerBatch; i++) {
          if (Date.now() - startTime >= this.maxTime) {
            break;
          }

          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;
          totalSimulations++;

          if (winner === player) {
            result.wins++;
          } else if (winner === null) {
            result.draws++;
          } else {
            result.losses++;
          }
        }

        // Update thinking display
        if (
          totalSimulations % (this.simulationsPerBatch * moves.length) ===
          0
        ) {
          const bestResult = this.getBestMoveResult(moveResults);
          this.emitThinkingUpdate({
            score: this.calculateWinRate(bestResult),
            depth: 0,
            nodesEvaluated: totalSimulations,
            bestMoveFound: bestResult.move,
          });
        }

        if (Date.now() - startTime >= this.maxTime) {
          break;
        }
      }
    }

    // Find the best move based on win rate
    const bestResult = this.getBestMoveResult(moveResults);
    const thinkingTime = Date.now() - startTime;

    return {
      move: bestResult.move,
      score: this.calculateWinRate(bestResult),
      depth: 0,
      nodesEvaluated: totalSimulations,
      thinkingTime,
    };
  }

  private getBestMoveResult(
    moveResults: Array<{
      move: MoveWithMetadata;
      wins: number;
      losses: number;
      draws: number;
      simulations: number;
    }>
  ) {
    return moveResults.reduce((best, current) => {
      const bestWinRate = this.calculateWinRate(best);
      const currentWinRate = this.calculateWinRate(current);

      return currentWinRate > bestWinRate ? current : best;
    });
  }

  private calculateWinRate(result: {
    wins: number;
    losses: number;
    draws: number;
    simulations: number;
  }): number {
    if (result.simulations === 0) return 0;

    // Win rate with draws counted as half wins
    return ((result.wins + result.draws * 0.5) / result.simulations) * 100;
  }

  /**
   * Run a single random simulation from the given game state
   */
  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;
    const maxMoves = 200; // Prevent infinite games

    while (moves < maxMoves) {
      const winner = checkWinConditions(currentState);
      if (winner) {
        return winner;
      }

      const availableMoves = this.generateLegalMoves(
        currentState,
        currentState.currentPlayer
      );

      if (availableMoves.length === 0) {
        return null; // Draw due to no moves
      }

      // Select random move
      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];

      // Apply the move
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null; // Draw due to move limit
  }
}
