import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./simpleBaseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

/**
 * Monte Carlo AI - matches Rust montecarlo.rs pure implementation
 * Uses random simulations to evaluate move quality
 */
export class MonteCarloAI extends BaseAI {
  private readonly simulationsPerBatch = 50;

  constructor() {
    super(0, 3000); // No depth limit, time-limited
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

    // Initialize simulation results for each move
    const moveResults = moves.map((move) => ({
      move,
      wins: 0,
      simulations: 0,
    }));

    let totalSimulations = 0;

    // Run simulations until timeout
    while (!this.isTimeUp()) {
      for (const result of moveResults) {
        // Run batch of simulations
        for (let i = 0; i < this.simulationsPerBatch && !this.isTimeUp(); i++) {
          const newGameState = this.applyMove(gameState, result.move);
          const winner = this.runRandomSimulation(newGameState);

          result.simulations++;
          totalSimulations++;

          if (winner === player) {
            result.wins++;
          }
        }

        // Periodic progress update
        if (
          totalSimulations % (this.simulationsPerBatch * moves.length) ===
          0
        ) {
          const bestResult = this.getBestResult(moveResults);
          this.emitThinkingUpdate({
            score: this.getWinRate(bestResult),
            depth: 0,
            nodesEvaluated: totalSimulations,
            bestMoveFound: bestResult.move,
          });
        }

        if (this.isTimeUp()) break;
      }
    }

    // Find best move by win rate
    const bestResult = this.getBestResult(moveResults);
    const thinkingTime = Date.now() - startTime;

    return {
      move: bestResult.move,
      score: this.getWinRate(bestResult),
      depth: 0,
      nodesEvaluated: totalSimulations,
      thinkingTime,
    };
  }

  private getBestResult(
    results: Array<{
      move: MoveWithMetadata;
      wins: number;
      simulations: number;
    }>
  ): { move: MoveWithMetadata; wins: number; simulations: number } {
    return results.reduce((best, current) => {
      const bestWinRate = this.getWinRate(best);
      const currentWinRate = this.getWinRate(current);
      return currentWinRate > bestWinRate ? current : best;
    });
  }

  private getWinRate(result: { wins: number; simulations: number }): number {
    return result.simulations > 0
      ? (result.wins / result.simulations) * 100
      : 0;
  }
}

/**
 * Hybrid Monte Carlo AI - matches Rust hybrid implementation
 * Combines alpha-beta analysis with Monte Carlo validation
 */
export class HybridMonteCarloAI extends BaseAI {
  private readonly alphaBetaTimeRatio = 0.4; // 40% alpha-beta, 60% monte carlo

  constructor() {
    super(6, 5000); // Longer thinking time for hybrid approach
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

    // Phase 1: Alpha-beta analysis to filter moves
    const alphaBetaTime = this.maxTime * this.alphaBetaTimeRatio;
    const alphaBetaResults = this.runAlphaBetaAnalysis(
      gameState,
      player,
      alphaBetaTime
    );

    // Check for guaranteed wins
    for (const result of alphaBetaResults) {
      if (Math.abs(result.score) >= 1000000) {
        return {
          move: result.move,
          score: result.score,
          depth: result.depth,
          nodesEvaluated: result.nodesEvaluated,
          thinkingTime: Date.now() - startTime,
        };
      }
    }

    // Phase 2: Filter moves and run Monte Carlo
    const filteredMoves = this.filterMoves(alphaBetaResults, player);
    const remainingTime = this.maxTime - (Date.now() - startTime);
    const monteCarloResult = this.runMonteCarloOnMoves(
      gameState,
      player,
      filteredMoves,
      remainingTime
    );

    const thinkingTime = Date.now() - startTime;
    const matchingAlphaBeta = alphaBetaResults.find((r) =>
      this.movesEqual(r.move, monteCarloResult.move)
    );

    return {
      move: monteCarloResult.move,
      score: monteCarloResult.score,
      depth: matchingAlphaBeta?.depth || 0,
      nodesEvaluated: monteCarloResult.nodesEvaluated,
      thinkingTime,
    };
  }

  private runAlphaBetaAnalysis(
    gameState: GameState,
    player: Player,
    timeLimit: number
  ): Array<{
    move: MoveWithMetadata;
    score: number;
    depth: number;
    nodesEvaluated: number;
  }> {
    const moves = this.generateLegalMoves(gameState, player);
    const results: Array<{
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    }> = [];
    const startTime = Date.now();

    for (const move of moves) {
      if (Date.now() - startTime >= timeLimit) break;

      const newGameState = this.applyMove(gameState, move);
      const maxDepth = Math.min(4, this.maxDepth);

      let bestScore = player === "red" ? -Infinity : Infinity;
      let finalDepth = 1;
      let totalNodes = 0;

      // Quick iterative deepening
      for (
        let depth = 1;
        depth <= maxDepth && Date.now() - startTime < timeLimit;
        depth++
      ) {
        const { score, nodesEvaluated } = this.alphaBeta(
          newGameState,
          depth,
          -Infinity,
          Infinity,
          player
        );

        bestScore = score;
        finalDepth = depth;
        totalNodes += nodesEvaluated;

        if (Math.abs(score) >= 1000000) break;
      }

      results.push({
        move,
        score: bestScore,
        depth: finalDepth,
        nodesEvaluated: totalNodes,
      });
    }

    return results;
  }

  private filterMoves(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    }>,
    player: Player
  ): MoveWithMetadata[] {
    if (results.length === 0) return [];

    // Find best score
    const bestScore = results.reduce(
      (best, result) => {
        return player === "red"
          ? Math.max(best, result.score)
          : Math.min(best, result.score);
      },
      player === "red" ? -Infinity : Infinity
    );

    // Keep moves within threshold of best
    const threshold = 50;
    return results
      .filter((result) => {
        const scoreDiff = Math.abs(result.score - bestScore);
        return scoreDiff <= threshold || Math.abs(result.score) >= 1000000;
      })
      .map((result) => result.move);
  }

  private runMonteCarloOnMoves(
    gameState: GameState,
    player: Player,
    moves: MoveWithMetadata[],
    timeLimit: number
  ): { move: MoveWithMetadata; score: number; nodesEvaluated: number } {
    if (moves.length === 0) {
      const allMoves = this.generateLegalMoves(gameState, player);
      return { move: allMoves[0], score: 0, nodesEvaluated: 0 };
    }

    if (moves.length === 1) {
      return { move: moves[0], score: 0, nodesEvaluated: 0 };
    }

    const startTime = Date.now();
    const moveResults = moves.map((move) => ({
      move,
      wins: 0,
      simulations: 0,
    }));
    let totalSimulations = 0;

    while (Date.now() - startTime < timeLimit) {
      for (const result of moveResults) {
        if (Date.now() - startTime >= timeLimit) break;

        const newGameState = this.applyMove(gameState, result.move);
        const winner = this.runRandomSimulation(newGameState);

        result.simulations++;
        totalSimulations++;

        if (winner === player) {
          result.wins++;
        }
      }
    }

    const bestResult = moveResults.reduce((best, current) => {
      const bestWinRate =
        best.simulations > 0 ? best.wins / best.simulations : 0;
      const currentWinRate =
        current.simulations > 0 ? current.wins / current.simulations : 0;
      return currentWinRate > bestWinRate ? current : best;
    });

    return {
      move: bestResult.move,
      score:
        bestResult.simulations > 0
          ? (bestResult.wins / bestResult.simulations) * 100
          : 0,
      nodesEvaluated: totalSimulations,
    };
  }

  private movesEqual(
    move1: MoveWithMetadata,
    move2: MoveWithMetadata
  ): boolean {
    return (
      move1.from[0] === move2.from[0] &&
      move1.from[1] === move2.from[1] &&
      move1.to[0] === move2.to[0] &&
      move1.to[1] === move2.to[1]
    );
  }
}
