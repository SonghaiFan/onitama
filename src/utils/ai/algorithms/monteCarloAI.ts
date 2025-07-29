import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, checkWinConditions } from "@/utils/gameManager";
import { eventBus } from "@/utils/eventBus";

// Extended AI thinking event with Monte Carlo specific data
interface MonteCarloThinkingEvent {
  score: number;
  nodesEvaluated: number;
  depth: number;
  elapsedTime?: number;
  bestMoveFound?: {
    from: [number, number];
    to: [number, number];
    cardIndex: number;
  };
  // Monte Carlo specific data
  moveWinRates?: Array<{
    move: string;
    winRate: number;
    simulations: number;
    wins: number;
    losses: number;
    draws: number;
  }>;
  phase?: "alpha-beta" | "monte-carlo" | "decision";
  filteredMoves?: number;
  totalMoves?: number;
}

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

    // Emit thinking start event
    eventBus.publish("ai_thinking_start", {});

    console.log(
      `🎯 [${player.toUpperCase()}] Starting Monte Carlo AI analysis...`
    );

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    console.log(`📊 Total legal moves: ${moves.length}`);

    if (moves.length === 1) {
      console.log(`⚡ Only one move available, taking it immediately`);
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
      });
      eventBus.publish("ai_thinking_end", {});
      return {
        move: moves[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // First, run Alpha-Beta to filter moves and find guaranteed wins
    console.log(`🔍 Phase 1: Alpha-Beta tactical analysis...`);
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Log Alpha-Beta results
    console.log(`📈 Alpha-Beta Results:`);
    alphaBetaResults.forEach(({ move, score }) => {
      const moveStr = `${move.piece.id} ${move.from.join(",")}→${move.to.join(
        ","
      )}`;
      console.log(`  ${moveStr}: ${score}`);
    });

    // Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        console.log(`🏆 GUARANTEED WIN FOUND! Taking move immediately`);
        this.emitMonteCarloUpdate({
          score,
          depth: 0,
          nodesEvaluated: 1,
          phase: "decision",
          bestMoveFound: move,
        });
        eventBus.publish("ai_thinking_end", {});
        return {
          move,
          score,
          depth: 0,
          nodesEvaluated: 1,
          thinkingTime: Date.now() - startTime,
        };
      }
    }

    // Filter moves based on Alpha-Beta scores
    const sortedMoves = alphaBetaResults
      .sort((a, b) => {
        if (player === "red") {
          return b.score - a.score; // Red maximizes
        } else {
          return a.score - b.score; // Blue minimizes
        }
      })
      .map(({ move }) => move);

    console.log(
      `🎯 Filtered to ${sortedMoves.length} moves based on Alpha-Beta scores`
    );

    // Run Monte Carlo on the filtered moves
    console.log(`🎲 Phase 2: Monte Carlo strategic analysis...`);
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      sortedMoves,
      monteCarloDuration
    );

    // Find best move based on Monte Carlo results
    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;
    console.log(
      `🎯 HYBRID AI SELECTED: ${
        bestResult.move.piece.id
      } ${bestResult.move.from.join(",")}→${bestResult.move.to.join(
        ","
      )} (${bestWinRate.toFixed(1)}% win rate)`
    );

    // Convert results to win rates for display
    const moveWinRates = monteCarloResults.map((result) => {
      const winRate = (result.score / result.simulations) * 100;
      const wins = Math.max(0, (result.score + result.simulations) / 2);
      const losses = Math.max(0, (result.simulations - result.score) / 2);
      const draws = result.simulations - wins - losses;

      return {
        move: `${result.move.piece.id} ${result.move.from.join(
          ","
        )}→${result.move.to.join(",")}`,
        winRate,
        simulations: result.simulations,
        wins: Math.round(wins),
        losses: Math.round(losses),
        draws: Math.round(draws),
      };
    });

    this.emitMonteCarloUpdate({
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      phase: "decision",
      bestMoveFound: bestResult.move,
      moveWinRates,
      totalMoves: moves.length,
      filteredMoves: sortedMoves.length,
    });

    eventBus.publish("ai_thinking_end", {});

    return {
      move: bestResult.move,
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  /**
   * Emit Monte Carlo specific thinking updates
   */
  private emitMonteCarloUpdate(data: MonteCarloThinkingEvent): void {
    const update = {
      ...data,
      elapsedTime: data.elapsedTime || Date.now() - this.startTime,
    };

    eventBus.publish("ai_thinking_update", update);

    // Also publish to a Monte Carlo specific event
    eventBus.publish("monte_carlo_update", update);
  }

  /**
   * Run Alpha-Beta filtering to identify guaranteed wins/losses
   */
  private runAlphaBetaFiltering(
    gameState: GameState,
    player: Player,
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number }> {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const moves = this.generateLegalMoves(gameState, player);
    const results: Array<{ move: MoveWithMetadata; score: number }> = [];

    console.log(`🔍 Running Alpha-Beta on ${moves.length} moves...`);

    for (const move of moves) {
      if (Date.now() >= deadline) {
        console.log(`⏰ Alpha-Beta timeout reached`);
        break;
      }

      const newGameState = this.simulateMove(gameState, move);
      const score = this.alphaBeta(newGameState, 4, -Infinity, Infinity).score;
      results.push({ move, score });
    }

    console.log(`✅ Alpha-Beta completed: ${results.length} moves evaluated`);
    return results;
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
    let batchCount = 0;

    console.log(
      `🎲 Starting Monte Carlo simulations (${moves.length} moves, ${duration}ms)...`
    );

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

      batchCount++;

      // Update thinking display every few batches
      if (batchCount % 5 === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        console.log(
          `📊 Batch ${batchCount}: ${totalSimulations} simulations, best win rate: ${bestWinRate.toFixed(
            1
          )}%`
        );

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
        });
      }
    }

    console.log(
      `✅ Monte Carlo completed: ${totalSimulations} total simulations`
    );
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

    // Emit thinking start event
    eventBus.publish("ai_thinking_start", {});

    console.log(
      `🎯 [${player.toUpperCase()}] Starting HARD Monte Carlo AI analysis...`
    );

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    console.log(`📊 Total legal moves: ${moves.length}`);

    if (moves.length === 1) {
      console.log(`⚡ Only one move available, taking it immediately`);
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
      });
      eventBus.publish("ai_thinking_end", {});
      return {
        move: moves[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // First, run Alpha-Beta to filter moves and find guaranteed wins
    console.log(`🔍 Phase 1: Alpha-Beta tactical analysis...`);
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Log Alpha-Beta results
    console.log(`📈 Alpha-Beta Results:`);
    alphaBetaResults.forEach(({ move, score }) => {
      const moveStr = `${move.piece.id} ${move.from.join(",")}→${move.to.join(
        ","
      )}`;
      console.log(`  ${moveStr}: ${score}`);
    });

    // Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        console.log(`🏆 HARD AI: GUARANTEED WIN FOUND!`);
        this.emitMonteCarloUpdate({
          score,
          depth: 0,
          nodesEvaluated: 1,
          phase: "decision",
          bestMoveFound: move,
          totalMoves: moves.length,
          filteredMoves: 1,
        });
        eventBus.publish("ai_thinking_end", {});
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

    console.log(`🎯 HARD AI: Best Alpha-Beta score: ${bestAlphaBetaScore}`);

    // Only keep moves with the BEST Alpha-Beta score
    const bestMoves = alphaBetaResults
      .filter(({ score }) => score === bestAlphaBetaScore)
      .map(({ move }) => move);

    console.log(
      `🎯 HARD AI: Filtered to ${bestMoves.length} best tactical moves`
    );

    // If all moves lead to loss, still choose a move
    const movesToEvaluate = bestMoves.length > 0 ? bestMoves : moves;

    if (movesToEvaluate.length === 1) {
      this.emitMonteCarloUpdate({
        score: bestAlphaBetaScore,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: movesToEvaluate[0],
        totalMoves: moves.length,
        filteredMoves: movesToEvaluate.length,
      });
      eventBus.publish("ai_thinking_end", {});
      return {
        move: movesToEvaluate[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // Run Monte Carlo on the best moves only
    console.log(`🎲 Phase 2: Monte Carlo strategic analysis...`);
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      movesToEvaluate,
      monteCarloDuration
    );

    // Find best move based on Monte Carlo results
    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;
    console.log(
      `🎯 HARD AI SELECTED: ${
        bestResult.move.piece.id
      } ${bestResult.move.from.join(",")}→${bestResult.move.to.join(
        ","
      )} (${bestWinRate.toFixed(1)}% win rate)`
    );

    // Convert results to win rates for display
    const moveWinRates = monteCarloResults.map((result) => {
      const winRate = (result.score / result.simulations) * 100;
      const wins = Math.max(0, (result.score + result.simulations) / 2);
      const losses = Math.max(0, (result.simulations - result.score) / 2);
      const draws = result.simulations - wins - losses;

      return {
        move: `${result.move.piece.id} ${result.move.from.join(
          ","
        )}→${result.move.to.join(",")}`,
        winRate,
        simulations: result.simulations,
        wins: Math.round(wins),
        losses: Math.round(losses),
        draws: Math.round(draws),
      };
    });

    this.emitMonteCarloUpdate({
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      phase: "decision",
      bestMoveFound: bestResult.move,
      moveWinRates,
      totalMoves: moves.length,
      filteredMoves: movesToEvaluate.length,
    });

    eventBus.publish("ai_thinking_end", {});

    return {
      move: bestResult.move,
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  private emitMonteCarloUpdate(data: MonteCarloThinkingEvent): void {
    const update = {
      ...data,
      elapsedTime: data.elapsedTime || Date.now() - this.startTime,
    };
    eventBus.publish("ai_thinking_update", update);
    eventBus.publish("monte_carlo_update", update);
  }

  /**
   * Run Alpha-Beta filtering to identify guaranteed wins/losses
   */
  private runAlphaBetaFiltering(
    gameState: GameState,
    player: Player,
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number }> {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const moves = this.generateLegalMoves(gameState, player);
    const results: Array<{ move: MoveWithMetadata; score: number }> = [];

    for (const move of moves) {
      if (Date.now() >= deadline) break;

      const newGameState = this.simulateMove(gameState, move);
      const score = this.alphaBeta(newGameState, 4, -Infinity, Infinity).score;
      results.push({ move, score });
    }

    return results;
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
    let batchCount = 0;

    console.log(
      `🎲 HARD AI: Starting Monte Carlo simulations (${moves.length} moves, ${duration}ms)...`
    );

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

      batchCount++;

      // Update thinking display every few batches
      if (batchCount % 5 === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        console.log(
          `📊 HARD AI Batch ${batchCount}: ${totalSimulations} simulations, best win rate: ${bestWinRate.toFixed(
            1
          )}%`
        );

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
        });
      }
    }

    console.log(
      `✅ HARD AI Monte Carlo completed: ${totalSimulations} total simulations`
    );
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

    // Emit thinking start event
    eventBus.publish("ai_thinking_start", {});

    console.log(
      `🎲 [${player.toUpperCase()}] Starting PURE Monte Carlo AI analysis...`
    );

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    console.log(`📊 Total legal moves: ${moves.length}`);

    if (moves.length === 1) {
      console.log(`⚡ Only one move available, taking it immediately`);
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
      });
      eventBus.publish("ai_thinking_end", {});
      return {
        move: moves[0],
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - startTime,
      };
    }

    // Run Monte Carlo directly on all moves
    console.log(`🎲 Phase 1: Monte Carlo analysis on all moves...`);
    const results = this.runMonteCarloSimulations(
      gameState,
      moves,
      this.maxTime
    );
    const bestResult = this.selectBestMove(results, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;
    console.log(
      `🎲 PURE AI SELECTED: ${
        bestResult.move.piece.id
      } ${bestResult.move.from.join(",")}→${bestResult.move.to.join(
        ","
      )} (${bestWinRate.toFixed(1)}% win rate)`
    );

    // Convert results to win rates for display
    const moveWinRates = results.map((result) => {
      const winRate = (result.score / result.simulations) * 100;
      const wins = Math.max(0, (result.score + result.simulations) / 2);
      const losses = Math.max(0, (result.simulations - result.score) / 2);
      const draws = result.simulations - wins - losses;

      return {
        move: `${result.move.piece.id} ${result.move.from.join(
          ","
        )}→${result.move.to.join(",")}`,
        winRate,
        simulations: result.simulations,
        wins: Math.round(wins),
        losses: Math.round(losses),
        draws: Math.round(draws),
      };
    });

    this.emitMonteCarloUpdate({
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      phase: "decision",
      bestMoveFound: bestResult.move,
      moveWinRates,
      totalMoves: moves.length,
      filteredMoves: moves.length,
    });

    eventBus.publish("ai_thinking_end", {});

    return {
      move: bestResult.move,
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      thinkingTime,
    };
  }

  private emitMonteCarloUpdate(data: MonteCarloThinkingEvent): void {
    const update = {
      ...data,
      elapsedTime: data.elapsedTime || Date.now() - this.startTime,
    };
    eventBus.publish("ai_thinking_update", update);
    eventBus.publish("monte_carlo_update", update);
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
    let batchCount = 0;

    console.log(
      `🎲 PURE AI: Starting Monte Carlo simulations (${moves.length} moves, ${duration}ms)...`
    );

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

      batchCount++;

      // Update thinking display every few batches
      if (batchCount % 5 === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        console.log(
          `📊 PURE AI Batch ${batchCount}: ${totalSimulations} simulations, best win rate: ${bestWinRate.toFixed(
            1
          )}%`
        );

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
        });
      }
    }

    console.log(
      `✅ PURE AI Monte Carlo completed: ${totalSimulations} total simulations`
    );
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
