import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, checkWinConditions } from "@/utils/gameManager";

export class HybridMonteCarloAI extends BaseAI {
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

    // First, run Alpha-Beta to filter moves and find guaranteed wins
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        return {
          move,
          score,
          depth: 0,
          nodesEvaluated: 1,
          thinkingTime: Date.now() - startTime,
        };
      }
    }

    // Filter out guaranteed losses
    const guaranteedLoseScore = player === "red" ? -1000000 : 1000000;
    const filteredMoves = alphaBetaResults
      .filter(({ score }) => score !== guaranteedLoseScore)
      .map(({ move }) => move);

    // If all moves lead to loss, still choose a move
    const movesToEvaluate = filteredMoves.length > 0 ? filteredMoves : moves;

    if (movesToEvaluate.length === 1) {
      return {
        move: movesToEvaluate[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // Run Monte Carlo on filtered moves
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      movesToEvaluate,
      monteCarloDuration
    );

    // Find best move based on Monte Carlo results
    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    return {
      move: bestResult.move,
      score: bestResult.score,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  /**
   * Run Alpha-Beta filtering to identify guaranteed wins/losses
   * Now uses proper iterative deepening like Rust implementation
   */
  private runAlphaBetaFiltering(
    gameState: GameState,
    player: Player,
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number }> {
    // Use the proper iterative deepening function
    const scoredMoves = this.movesScoredDeepening(gameState, player, duration);

    if (!scoredMoves) {
      // Fallback to basic scoring if iterative deepening fails
      const moves = this.generateLegalMoves(gameState, player);
      return moves.map((move) => ({
        move,
        score: this.alphaBeta(
          this.simulateMove(gameState, move),
          4,
          -Infinity,
          Infinity
        ).score,
      }));
    }

    return scoredMoves;
  }

  /**
   * Run Monte Carlo simulations on filtered moves
   */
  private runMonteCarloSimulations(
    gameState: GameState,
    moves: MoveWithMetadata[],
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number; simulations: number }> {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }> = moves.map((move) => ({ move, score: 0, simulations: 0 }));

    let totalSimulations = 0;

    while (Date.now() < deadline) {
      for (let i = 0; i < this.simulationsPerBatch; i++) {
        if (Date.now() >= deadline) break;

        for (const result of results) {
          if (Date.now() >= deadline) break;

          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;
          totalSimulations++;

          // Score based on winner (1 for win, -1 for loss, 0 for draw)
          if (winner === gameState.currentPlayer) {
            result.score += 1;
          } else if (winner === null) {
            // Draw counts as 0
          } else {
            result.score -= 1;
          }
        }
      }

      // Update thinking display
      if (totalSimulations % (this.simulationsPerBatch * moves.length) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        this.emitThinkingUpdate({
          score: (bestResult.score / bestResult.simulations) * 100,
          depth: 0,
          nodesEvaluated: totalSimulations,
          bestMoveFound: bestResult.move,
        });
      }
    }

    return results;
  }

  /**
   * Select the best move based on Monte Carlo results
   */
  private selectBestMove(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }>,
    player: Player
  ): { move: MoveWithMetadata; score: number; simulations: number } {
    return results.reduce((best, current) => {
      const bestWinRate =
        best.simulations > 0 ? best.score / best.simulations : 0;
      const currentWinRate =
        current.simulations > 0 ? current.score / current.simulations : 0;

      if (player === "red") {
        return currentWinRate > bestWinRate ? current : best;
      } else {
        return currentWinRate < bestWinRate ? current : best;
      }
    });
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
      const randomMove = this.selectRandomMove(availableMoves);

      // Apply the move
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null; // Draw due to move limit
  }
}

/**
 * Hard Hybrid Monte Carlo AI - Only considers moves with the best Alpha-Beta score
 */
export class HardMonteCarloAI extends BaseAI {
  private readonly simulationsPerBatch = 50;

  constructor() {
    super(0, 3000);
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

    // First, run Alpha-Beta to filter moves and find guaranteed wins
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        return {
          move,
          score,
          depth: 0,
          nodesEvaluated: 1,
          thinkingTime: Date.now() - startTime,
        };
      }
    }

    // Find the best Alpha-Beta score
    const bestAlphaBetaScore = alphaBetaResults.reduce((best, current) => {
      if (player === "red") {
        return current.score > best.score ? current : best;
      } else {
        return current.score < best.score ? current : best;
      }
    }).score;

    // Only keep moves with the BEST Alpha-Beta score
    const bestMoves = alphaBetaResults
      .filter(({ score }) => score === bestAlphaBetaScore)
      .map(({ move }) => move);

    // If all moves lead to loss, still choose a move
    const movesToEvaluate = bestMoves.length > 0 ? bestMoves : moves;

    if (movesToEvaluate.length === 1) {
      return {
        move: movesToEvaluate[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // Run Monte Carlo on the best moves only
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      movesToEvaluate,
      monteCarloDuration
    );

    // Find best move based on Monte Carlo results
    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    return {
      move: bestResult.move,
      score: bestResult.score,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  /**
   * Run Alpha-Beta filtering to identify guaranteed wins/losses
   * Now uses proper iterative deepening like Rust implementation
   */
  private runAlphaBetaFiltering(
    gameState: GameState,
    player: Player,
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number }> {
    // Use the proper iterative deepening function
    const scoredMoves = this.movesScoredDeepening(gameState, player, duration);

    if (!scoredMoves) {
      // Fallback to basic scoring if iterative deepening fails
      const moves = this.generateLegalMoves(gameState, player);
      return moves.map((move) => ({
        move,
        score: this.alphaBeta(
          this.simulateMove(gameState, move),
          4,
          -Infinity,
          Infinity
        ).score,
      }));
    }

    return scoredMoves;
  }

  /**
   * Run Monte Carlo simulations on filtered moves
   */
  private runMonteCarloSimulations(
    gameState: GameState,
    moves: MoveWithMetadata[],
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number; simulations: number }> {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }> = moves.map((move) => ({ move, score: 0, simulations: 0 }));

    let totalSimulations = 0;

    while (Date.now() < deadline) {
      for (let i = 0; i < this.simulationsPerBatch; i++) {
        if (Date.now() >= deadline) break;

        for (const result of results) {
          if (Date.now() >= deadline) break;

          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;
          totalSimulations++;

          if (winner === gameState.currentPlayer) {
            result.score += 1;
          } else if (winner === null) {
            // Draw counts as 0
          } else {
            result.score -= 1;
          }
        }
      }

      // Update thinking display
      if (totalSimulations % (this.simulationsPerBatch * moves.length) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        this.emitThinkingUpdate({
          score: (bestResult.score / bestResult.simulations) * 100,
          depth: 0,
          nodesEvaluated: totalSimulations,
          bestMoveFound: bestResult.move,
        });
      }
    }

    return results;
  }

  /**
   * Select the best move based on Monte Carlo results
   */
  private selectBestMove(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }>,
    player: Player
  ): { move: MoveWithMetadata; score: number; simulations: number } {
    return results.reduce((best, current) => {
      const bestWinRate =
        best.simulations > 0 ? best.score / best.simulations : 0;
      const currentWinRate =
        current.simulations > 0 ? current.score / current.simulations : 0;

      if (player === "red") {
        return currentWinRate > bestWinRate ? current : best;
      } else {
        return currentWinRate < bestWinRate ? current : best;
      }
    });
  }

  /**
   * Run a single random simulation from the given game state
   */
  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;
    const maxMoves = 200;

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
        return null;
      }

      const randomMove = this.selectRandomMove(availableMoves);
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null;
  }

  /**
   * Rank all moves by combining Alpha-Beta and Monte Carlo scores
   * This matches the Rust hybrid_hard_montecarlo_rank_moves function
   */
  async rankMoves(
    gameState: GameState,
    player: Player
  ): Promise<Array<{ move: MoveWithMetadata; score: number }>> {
    this.startTime = Date.now();

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      return [];
    }

    if (moves.length === 1) {
      return [{ move: moves[0], score: 0 }];
    }

    // Run Alpha-Beta on all moves
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Run Monte Carlo on all moves
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      moves,
      monteCarloDuration
    );

    // Combine scores like Rust implementation
    const combinedResults: Array<{ move: MoveWithMetadata; score: number }> =
      [];

    for (const alphaResult of alphaBetaResults) {
      const monteResult = monteCarloResults.find(
        (m) => m.move === alphaResult.move
      );

      if (!monteResult) continue;

      let combinedScore: number;

      // Preserve guaranteed wins/losses from Alpha-Beta
      if (alphaResult.score === 1000000 || alphaResult.score === -1000000) {
        combinedScore = alphaResult.score;
      } else {
        // Average both scores (like Rust implementation)
        const monteScore = (monteResult.score / monteResult.simulations) * 100;
        combinedScore = alphaResult.score / 2 + monteScore / 2;
      }

      combinedResults.push({
        move: alphaResult.move,
        score: combinedScore,
      });
    }

    // Sort by score (best first for red, worst first for blue)
    combinedResults.sort((a, b) => {
      if (player === "red") {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });

    return combinedResults;
  }
}

/**
 * Pure Monte Carlo AI without Alpha-Beta filtering
 */
export class PureMonteCarloAI extends BaseAI {
  private readonly simulationsPerBatch = 50;

  constructor() {
    super(0, 3000);
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

    // Run Monte Carlo directly on all moves
    const results = this.runMonteCarloSimulations(
      gameState,
      moves,
      this.maxTime
    );
    const bestResult = this.selectBestMove(results, player);
    const thinkingTime = Date.now() - startTime;

    return {
      move: bestResult.move,
      score: (bestResult.score / bestResult.simulations) * 100,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  /**
   * Run Monte Carlo simulations on all moves
   */
  private runMonteCarloSimulations(
    gameState: GameState,
    moves: MoveWithMetadata[],
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number; simulations: number }> {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }> = moves.map((move) => ({ move, score: 0, simulations: 0 }));

    let totalSimulations = 0;

    while (Date.now() < deadline) {
      for (let i = 0; i < this.simulationsPerBatch; i++) {
        if (Date.now() >= deadline) break;

        for (const result of results) {
          if (Date.now() >= deadline) break;

          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;
          totalSimulations++;

          if (winner === gameState.currentPlayer) {
            result.score += 1;
          } else if (winner === null) {
            // Draw counts as 0
          } else {
            result.score -= 1;
          }
        }
      }

      // Update thinking display
      if (totalSimulations % (this.simulationsPerBatch * moves.length) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        this.emitThinkingUpdate({
          score: (bestResult.score / bestResult.simulations) * 100,
          depth: 0,
          nodesEvaluated: totalSimulations,
          bestMoveFound: bestResult.move,
        });
      }
    }

    return results;
  }

  /**
   * Select the best move based on Monte Carlo results
   */
  private selectBestMove(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }>,
    player: Player
  ): { move: MoveWithMetadata; score: number; simulations: number } {
    return results.reduce((best, current) => {
      const bestWinRate =
        best.simulations > 0 ? best.score / best.simulations : 0;
      const currentWinRate =
        current.simulations > 0 ? current.score / current.simulations : 0;

      if (player === "red") {
        return currentWinRate > bestWinRate ? current : best;
      } else {
        return currentWinRate < bestWinRate ? current : best;
      }
    });
  }

  /**
   * Run a single random simulation from the given game state
   */
  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;
    const maxMoves = 200;

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
        return null;
      }

      const randomMove = this.selectRandomMove(availableMoves);
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null;
  }
}
