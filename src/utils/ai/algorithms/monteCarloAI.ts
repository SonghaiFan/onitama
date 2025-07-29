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
  // Enhanced fields
  aiType?: "hybrid" | "hard" | "pure";
  guaranteedWin?: boolean;
  alphaBetaScores?: Array<{
    move: string;
    score: number;
  }>;
  batchProgress?: {
    batchNumber: number;
    totalSimulations: number;
    bestWinRate: number;
  };
  timeoutReached?: boolean;
}

/**
 * Pure Monte Carlo AI
 */
export class PureMonteCarloAI extends BaseAI {
  private readonly iterationsPerTimeCheck = 50;
  private readonly maxSimulationMoves = 1000;

  constructor() {
    super(0, 3000);
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const startTime = this.startTime;

    eventBus.publish("ai_thinking_start", {});

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    if (moves.length === 1) {
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
        aiType: "pure",
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

    // Run Monte Carlo directly on all moves (pure implementation)
    const results = this.runMonteCarloSimulations(
      gameState,
      moves,
      this.maxTime
    );
    const bestResult = this.selectBestMove(results, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;

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
      aiType: "pure",
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
   * Core Monte Carlo simulation
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
    const timeCheckIterations = this.iterationsPerTimeCheck;

    // monte carlo loop structure
    while (Date.now() < deadline) {
      for (let i = 0; i < timeCheckIterations; i++) {
        for (const result of results) {
          totalSimulations++;
          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;

          // scoring: Red +1, Blue -1, Draw 0
          if (winner === "red") {
            result.score += 1;
          } else if (winner === "blue") {
            result.score -= 1;
          }
          // Draw (winner === null) adds 0 implicitly
        }
      }

      // Update display every few time check cycles for performance
      if (totalSimulations % (timeCheckIterations * 5) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
          aiType: "pure",
        });
      }
    }

    return results;
  }

  /**
   * Select best move
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
      const compare =
        player === "red"
          ? (a: number, b: number) => a > b
          : (a: number, b: number) => a < b;

      return compare(current.score, best.score) ? current : best;
    });
  }

  /**
   * Random playout simulation
   */
  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;

    // simulation loop (1000 moves max)
    while (moves < this.maxSimulationMoves) {
      const winner = checkWinConditions(currentState);
      if (winner) {
        return winner;
      }

      const availableMoves = this.generateLegalMoves(
        currentState,
        currentState.currentPlayer
      );

      if (availableMoves.length === 0) {
        return null; // Draw
      }

      const randomMove = this.selectRandomMove(availableMoves);
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null; // Draw if max moves reached
  }
}

/**
 * Hybrid Monte Carlo AI
 */
export class HybridMonteCarloAI extends BaseAI {
  private readonly iterationsPerTimeCheck = 100;
  private readonly maxSimulationMoves = 1000;

  constructor() {
    super(0, 3000);
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const startTime = this.startTime;

    eventBus.publish("ai_thinking_start", {});

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    if (moves.length === 1) {
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
        aiType: "hybrid",
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

    // Step 1: Run Alpha-Beta for half the time
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Step 2: Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        this.emitMonteCarloUpdate({
          score,
          depth: 0,
          nodesEvaluated: 1,
          phase: "decision",
          bestMoveFound: move,
          aiType: "hybrid",
          guaranteedWin: true,
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

    // Step 3: Filter out guaranteed losing moves
    const guaranteedLoseScore = player === "red" ? -1000000 : 1000000;
    const filteredMoves = alphaBetaResults
      .filter(({ score }) => score !== guaranteedLoseScore)
      .map(({ move }) => move);

    // If all moves lead to loss, still choose a move
    const movesToEvaluate = filteredMoves.length > 0 ? filteredMoves : moves;

    if (movesToEvaluate.length === 1) {
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: movesToEvaluate[0],
        totalMoves: moves.length,
        filteredMoves: movesToEvaluate.length,
        aiType: "hybrid",
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

    // Step 4: Run Monte Carlo on filtered moves for remaining time
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      movesToEvaluate,
      monteCarloDuration
    );

    // Step 5: Select best move
    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;

    // Convert results for display
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

    const alphaBetaScores = alphaBetaResults.map(({ move, score }) => ({
      move: `${move.piece.id} ${move.from.join(",")}→${move.to.join(",")}`,
      score,
    }));

    this.emitMonteCarloUpdate({
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      phase: "decision",
      bestMoveFound: bestResult.move,
      totalMoves: moves.length,
      filteredMoves: movesToEvaluate.length,
      aiType: "hybrid",
      moveWinRates,
      alphaBetaScores,
    });

    eventBus.publish("ai_thinking_end", {});

    return {
      move: bestResult.move,
      score: bestResult.score,
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
    const timeCheckIterations = this.iterationsPerTimeCheck;

    while (Date.now() < deadline) {
      for (let i = 0; i < timeCheckIterations; i++) {
        for (const result of results) {
          totalSimulations++;
          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;

          if (winner === "red") {
            result.score += 1;
          } else if (winner === "blue") {
            result.score -= 1;
          }
        }
      }

      // Update display periodically
      if (totalSimulations % (timeCheckIterations * 10) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
          aiType: "hybrid",
          batchProgress: {
            batchNumber: Math.floor(totalSimulations / timeCheckIterations),
            totalSimulations,
            bestWinRate,
          },
        });
      }
    }

    return results;
  }

  private selectBestMove(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }>,
    player: Player
  ): { move: MoveWithMetadata; score: number; simulations: number } {
    return results.reduce((best, current) => {
      const compare =
        player === "red"
          ? (a: number, b: number) => a > b
          : (a: number, b: number) => a < b;

      return compare(current.score, best.score) ? current : best;
    });
  }

  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;

    while (moves < this.maxSimulationMoves) {
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

/**
 * Hard Hybrid Monte Carlo AI
 */
export class HardMonteCarloAI extends BaseAI {
  private readonly iterationsPerTimeCheck = 50;
  private readonly maxSimulationMoves = 1000;

  constructor() {
    super(0, 8000);
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const startTime = this.startTime;

    eventBus.publish("ai_thinking_start", {});

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      eventBus.publish("ai_thinking_end", {});
      throw new Error("No valid moves available for AI");
    }

    if (moves.length === 1) {
      this.emitMonteCarloUpdate({
        score: 0,
        depth: 0,
        nodesEvaluated: 1,
        phase: "decision",
        bestMoveFound: moves[0],
        totalMoves: 1,
        filteredMoves: 1,
        aiType: "hard",
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

    // Step 1: Alpha-Beta filtering (half time)
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Step 2: Check for guaranteed wins
    const guaranteedWinScore = player === "red" ? 1000000 : -1000000;
    for (const { move, score } of alphaBetaResults) {
      if (score === guaranteedWinScore) {
        this.emitMonteCarloUpdate({
          score,
          depth: 0,
          nodesEvaluated: 1,
          phase: "decision",
          bestMoveFound: move,
          totalMoves: moves.length,
          filteredMoves: 1,
          aiType: "hard",
          guaranteedWin: true,
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

    // Step 3: Find BEST Alpha-Beta score (key difference from hybrid)
    const bestAlphaBetaScore = alphaBetaResults.reduce((best, current) => {
      if (player === "red") {
        return current.score > best.score ? current : best;
      } else {
        return current.score < best.score ? current : best;
      }
    }).score;

    // Step 4: Only keep moves with the BEST score
    const bestMoves = alphaBetaResults
      .filter(({ score }) => score === bestAlphaBetaScore)
      .map(({ move }) => move);

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
        aiType: "hard",
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

    // Step 5: Monte Carlo on best moves only
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      movesToEvaluate,
      monteCarloDuration
    );

    const bestResult = this.selectBestMove(monteCarloResults, player);
    const thinkingTime = Date.now() - startTime;

    const bestWinRate = (bestResult.score / bestResult.simulations) * 100;

    // Display data
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

    const alphaBetaScores = alphaBetaResults.map(({ move, score }) => ({
      move: `${move.piece.id} ${move.from.join(",")}→${move.to.join(",")}`,
      score,
    }));

    this.emitMonteCarloUpdate({
      score: bestWinRate,
      depth: 0,
      nodesEvaluated: bestResult.simulations,
      phase: "decision",
      bestMoveFound: bestResult.move,
      moveWinRates,
      totalMoves: moves.length,
      filteredMoves: movesToEvaluate.length,
      aiType: "hard",
      alphaBetaScores,
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
    const timeCheckIterations = this.iterationsPerTimeCheck;

    while (Date.now() < deadline) {
      for (let i = 0; i < timeCheckIterations; i++) {
        for (const result of results) {
          totalSimulations++;
          const newGameState = this.simulateMove(gameState, result.move);
          const winner = this.runRandomPlayoutSimulation(newGameState);

          result.simulations++;

          if (winner === "red") {
            result.score += 1;
          } else if (winner === "blue") {
            result.score -= 1;
          }
        }
      }

      if (totalSimulations % (timeCheckIterations * 5) === 0) {
        const bestResult = this.selectBestMove(
          results,
          gameState.currentPlayer
        );
        const bestWinRate =
          bestResult.simulations > 0
            ? (bestResult.score / bestResult.simulations) * 100
            : 0;

        this.emitMonteCarloUpdate({
          score: bestWinRate,
          depth: 0,
          nodesEvaluated: totalSimulations,
          phase: "monte-carlo",
          bestMoveFound: bestResult.move,
          aiType: "hard",
        });
      }
    }

    return results;
  }

  private selectBestMove(
    results: Array<{
      move: MoveWithMetadata;
      score: number;
      simulations: number;
    }>,
    player: Player
  ): { move: MoveWithMetadata; score: number; simulations: number } {
    return results.reduce((best, current) => {
      const compare =
        player === "red"
          ? (a: number, b: number) => a > b
          : (a: number, b: number) => a < b;

      return compare(current.score, best.score) ? current : best;
    });
  }

  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;

    while (moves < this.maxSimulationMoves) {
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

    // Run Alpha-Beta on all moves (half time)
    const alphaBetaDuration = this.maxTime / 2;
    const alphaBetaResults = this.runAlphaBetaFiltering(
      gameState,
      player,
      alphaBetaDuration
    );

    // Run Monte Carlo on all moves (half time)
    const monteCarloDuration = this.maxTime / 2;
    const monteCarloResults = this.runMonteCarloSimulations(
      gameState,
      moves,
      monteCarloDuration
    );

    // Combine scores
    const combinedResults: Array<{ move: MoveWithMetadata; score: number }> =
      [];

    for (const alphaResult of alphaBetaResults) {
      const monteResult = monteCarloResults.find(
        (m) =>
          m.move.from[0] === alphaResult.move.from[0] &&
          m.move.from[1] === alphaResult.move.from[1] &&
          m.move.to[0] === alphaResult.move.to[0] &&
          m.move.to[1] === alphaResult.move.to[1] &&
          m.move.cardIndex === alphaResult.move.cardIndex
      );

      if (!monteResult) continue;

      let combinedScore: number;

      // Preserve guaranteed wins/losses from Alpha-Beta
      if (alphaResult.score === 1000000 || alphaResult.score === -1000000) {
        combinedScore = alphaResult.score;
      } else {
        // Average both scores (exact Rust: (alpha_score / 2) + (monte_score / 2))
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
        return b.score - a.score; // Higher scores first
      } else {
        return a.score - b.score; // Lower scores first
      }
    });

    return combinedResults;
  }
}
