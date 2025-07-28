import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, checkWinConditions } from "@/utils/gameManager";

export class MonteCarloAI extends BaseAI {
  private readonly simulationsPerBatch = 50; // Check timeout every 50 simulations

  constructor() {
    super(0, 3000); // No depth limit, but time-limited
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

export class HybridMonteCarloAI extends BaseAI {
  private readonly alphaBetaTimeRatio = 0.4; // 40% time for alpha-beta, 60% for Monte Carlo

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

    // Phase 1: Alpha-Beta analysis to filter moves
    const alphaBetaTime = this.maxTime * this.alphaBetaTimeRatio;
    const alphaBetaResults = await this.runAlphaBetaAnalysis(
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

    // Phase 2: Filter out clearly bad moves
    const filteredMoves = this.filterMoves(alphaBetaResults, player);

    // Phase 3: Monte Carlo validation on remaining moves
    const remainingTime = this.maxTime - (Date.now() - startTime);
    const monteCarloResult = await this.runMonteCarloValidation(
      gameState,
      player,
      filteredMoves,
      remainingTime
    );

    const thinkingTime = Date.now() - startTime;

    return {
      move: monteCarloResult.move,
      score: monteCarloResult.score,
      depth:
        alphaBetaResults.find(
          (r) =>
            r.move.from[0] === monteCarloResult.move.from[0] &&
            r.move.from[1] === monteCarloResult.move.from[1] &&
            r.move.to[0] === monteCarloResult.move.to[0] &&
            r.move.to[1] === monteCarloResult.move.to[1]
        )?.depth || 0,
      nodesEvaluated: monteCarloResult.nodesEvaluated,
      thinkingTime,
    };
  }

  private async runAlphaBetaAnalysis(
    gameState: GameState,
    player: Player,
    timeLimit: number
  ): Promise<
    Array<{
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    }>
  > {
    const startTime = Date.now();
    const moves = this.generateLegalMoves(gameState, player);
    const results: Array<{
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    }> = [];

    // Quick shallow analysis of each move
    for (const move of moves) {
      if (Date.now() - startTime >= timeLimit) break;

      const newGameState = this.simulateMove(gameState, move);
      const remainingTime = timeLimit - (Date.now() - startTime);
      const depthLimit = Math.min(4, this.maxDepth);

      let bestScore = player === "red" ? -Infinity : Infinity;
      let finalDepth = 1;
      let totalNodes = 0;

      // Quick iterative deepening
      for (
        let depth = 1;
        depth <= depthLimit && Date.now() - startTime < timeLimit;
        depth++
      ) {
        const { score, nodesEvaluated } = this.alphaBetaMinimax(
          newGameState,
          depth,
          -Infinity,
          Infinity,
          player,
          remainingTime / depthLimit
        );

        bestScore = score;
        finalDepth = depth;
        totalNodes += nodesEvaluated;

        if (Math.abs(score) >= 1000000) break; // Found guaranteed win/loss
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
    alphaBetaResults: Array<{
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    }>,
    player: Player
  ): MoveWithMetadata[] {
    if (alphaBetaResults.length === 0) return [];

    // Find the best score
    const bestScore = alphaBetaResults.reduce(
      (best, result) => {
        return player === "red"
          ? Math.max(best, result.score)
          : Math.min(best, result.score);
      },
      player === "red" ? -Infinity : Infinity
    );

    // Only keep moves that are close to the best (within threshold)
    const threshold = 50; // Adjust based on your evaluation scale
    return alphaBetaResults
      .filter((result) => {
        const scoreDiff = Math.abs(result.score - bestScore);
        return scoreDiff <= threshold || Math.abs(result.score) >= 1000000; // Always keep guaranteed wins
      })
      .map((result) => result.move);
  }

  private async runMonteCarloValidation(
    gameState: GameState,
    player: Player,
    moves: MoveWithMetadata[],
    timeLimit: number
  ): Promise<{
    move: MoveWithMetadata;
    score: number;
    nodesEvaluated: number;
  }> {
    const startTime = Date.now();

    if (moves.length === 0) {
      const allMoves = this.generateLegalMoves(gameState, player);
      return {
        move: allMoves[0],
        score: 0,
        nodesEvaluated: 0,
      };
    }

    if (moves.length === 1) {
      return {
        move: moves[0],
        score: 0,
        nodesEvaluated: 0,
      };
    }

    // Run Monte Carlo simulations on filtered moves
    const moveResults = moves.map((move) => ({
      move,
      wins: 0,
      simulations: 0,
    }));

    let totalSimulations = 0;

    while (Date.now() - startTime < timeLimit) {
      for (const result of moveResults) {
        if (Date.now() - startTime >= timeLimit) break;

        const newGameState = this.simulateMove(gameState, result.move);
        const winner = this.runRandomPlayoutSimulation(newGameState);

        result.simulations++;
        totalSimulations++;

        if (winner === player) {
          result.wins++;
        }
      }
    }

    // Find best move based on win rate
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

  private alphaBetaMinimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player,
    timeLimit: number
  ): { score: number; nodesEvaluated: number } {
    const startTime = Date.now();
    let nodesEvaluated = 1;

    if (
      depth === 0 ||
      this.isGameOver(gameState) ||
      Date.now() - startTime >= timeLimit
    ) {
      return {
        score: this.evaluatePosition(gameState, maximizingPlayer),
        nodesEvaluated,
      };
    }

    const moves = this.generateLegalMoves(gameState, gameState.currentPlayer);
    if (moves.length === 0) {
      return {
        score: this.evaluatePosition(gameState, maximizingPlayer),
        nodesEvaluated,
      };
    }

    const isMaximizing = gameState.currentPlayer === maximizingPlayer;
    let value = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      if (Date.now() - startTime >= timeLimit) break;

      const newGameState = this.simulateMove(gameState, move);
      const result = this.alphaBetaMinimax(
        newGameState,
        depth - 1,
        alpha,
        beta,
        maximizingPlayer,
        timeLimit - (Date.now() - startTime)
      );

      nodesEvaluated += result.nodesEvaluated;

      if (isMaximizing) {
        value = Math.max(value, result.score);
        alpha = Math.max(alpha, value);
        if (value >= beta) break;
      } else {
        value = Math.min(value, result.score);
        beta = Math.min(beta, value);
        if (value <= alpha) break;
      }
    }

    return { score: value, nodesEvaluated };
  }

  private runRandomPlayoutSimulation(gameState: GameState): Player | null {
    let currentState = gameState;
    let moves = 0;
    const maxMoves = 200;

    while (moves < maxMoves) {
      const winner = checkWinConditions(currentState);
      if (winner) return winner;

      const availableMoves = this.generateLegalMoves(
        currentState,
        currentState.currentPlayer
      );

      if (availableMoves.length === 0) return null;

      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];

      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null;
  }

  private evaluatePosition(gameState: GameState, player: Player): number {
    const winner = checkWinConditions(gameState);
    if (winner) {
      return winner === player ? 1000000 : -1000000;
    }

    let redPieces = 0;
    let bluePieces = 0;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = gameState.board[row][col];
        if (piece && !piece.isWindSpirit) {
          if (piece.player === "red") redPieces++;
          else if (piece.player === "blue") bluePieces++;
        }
      }
    }

    const valueFromPawnCount = (count: number): number => {
      switch (count) {
        case 0:
          return 0;
        case 1:
          return 8;
        case 2:
          return 14;
        case 3:
          return 18;
        case 4:
          return 20;
        default:
          return 20;
      }
    };

    const redValue = valueFromPawnCount(redPieces);
    const blueValue = valueFromPawnCount(bluePieces);

    return redValue - blueValue;
  }
}
