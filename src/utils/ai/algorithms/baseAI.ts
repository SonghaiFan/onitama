import { GameState, Player } from "@/types/game";
import {
  MoveWithMetadata,
  getAllPlayerMoves,
  checkWinConditions,
} from "@/utils/gameManager";
import { eventBus, AIThinkingUpdateEvent } from "@/utils/eventBus";

export interface AIMoveResult {
  move: MoveWithMetadata;
  score: number;
  depth: number;
  nodesEvaluated: number;
  thinkingTime: number;
}

/**
 * Simple base class for AI algorithms - inspired by Rust implementation
 * Provides essential utilities without complex built-in algorithms
 * Each algorithm should implement its own strategy
 */
export abstract class BaseAI {
  protected maxDepth: number;
  protected maxTime: number; // milliseconds
  protected startTime: number = 0;

  constructor(maxDepth: number = 4, maxTime: number = 5000) {
    this.maxDepth = maxDepth;
    this.maxTime = maxTime;
  }

  /**
   * Main method to find the best move - must be implemented by each algorithm
   */
  abstract findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult>;

  // ============================================================================
  // CORE UTILITIES (Essential for all algorithms)
  // ============================================================================

  /**
   * Generate all legal moves for a player
   */
  protected generateLegalMoves(
    gameState: GameState,
    player: Player
  ): MoveWithMetadata[] {
    return getAllPlayerMoves(gameState, player);
  }

  /**
   * Apply a move and return new game state (pure function)
   * Simple deep copy approach - can be optimized later if needed
   */
  protected simulateMove(
    gameState: GameState,
    move: MoveWithMetadata
  ): GameState {
    // Deep copy the game state using JSON (simple but effective)
    const newState: GameState = JSON.parse(JSON.stringify(gameState));

    // Apply the move
    const fromPiece = newState.board[move.from[0]][move.from[1]];
    if (fromPiece) {
      // Move the piece
      newState.board[move.to[0]][move.to[1]] = fromPiece;
      newState.board[move.from[0]][move.from[1]] = null;

      // Handle card exchange
      const currentPlayer = newState.currentPlayer;
      const playerState = newState.players[currentPlayer];
      const usedCard = playerState.cards[move.cardIndex];
      const sharedCard = newState.sharedCard;

      // Exchange cards: used card becomes shared, shared card goes to player
      newState.sharedCard = usedCard;
      if (sharedCard) {
        playerState.cards[move.cardIndex] = sharedCard;
      }

      // Switch current player
      newState.currentPlayer = currentPlayer === "red" ? "blue" : "red";
    }

    return newState;
  }

  /**
   * Check if the game is finished
   */
  protected isGameOver(gameState: GameState): boolean {
    return checkWinConditions(gameState) !== null;
  }

  /**
   * Basic position evaluation (matches Rust heuristics.rs)
   * Red maximizing (+), Blue minimizing (-)
   */
  protected basicValue(gameState: GameState): number {
    // Check for game over
    const winner = checkWinConditions(gameState);
    if (winner === "red") return 1000000; // i64::MAX equivalent
    if (winner === "blue") return -1000000; // i64::MIN equivalent

    // Count pieces for each player (excluding wind spirits)
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

    // Value function based on piece count (from Rust implementation)
    const valueFromPawnCount = (count: number): number => {
      switch (count) {
        case 0:
          return 0;
        case 1:
          return 8;
        case 2:
          return 8 + 6; // 14
        case 3:
          return 8 + 6 + 4; // 18
        case 4:
          return 8 + 6 + 4 + 2; // 20
        default:
          return 20;
      }
    };

    const redValue = valueFromPawnCount(redPieces);
    const blueValue = valueFromPawnCount(bluePieces);

    return redValue - blueValue;
  }

  // ============================================================================
  // UTILITY METHODS (Optional helpers)
  // ============================================================================

  /**
   * Timeout check utility
   */
  protected isTimeUp(): boolean {
    return Date.now() - this.startTime >= this.maxTime;
  }

  /**
   * Emit thinking update to event bus
   */
  protected emitThinkingUpdate(data: Partial<AIThinkingUpdateEvent>): void {
    const update: AIThinkingUpdateEvent = {
      score: data.score || 0,
      nodesEvaluated: data.nodesEvaluated || 0,
      depth: data.depth || 0,
      elapsedTime: Date.now() - this.startTime,
      bestMoveFound: data.bestMoveFound,
    };

    eventBus.publish("ai_thinking_update", update);
  }

  /**
   * Random selection utility
   */
  protected selectRandomMove(moves: MoveWithMetadata[]): MoveWithMetadata {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /**
   * Shuffle array in place (for randomized move ordering)
   */
  protected shuffleMoves(moves: MoveWithMetadata[]): MoveWithMetadata[] {
    const shuffled = [...moves];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ============================================================================
  // ALGORITHM BUILDING BLOCKS (For implementing classic algorithms)
  // ============================================================================

  /**
   * Basic minimax implementation
   * Returns the score for the maximizing player (red = positive, blue = negative)
   */
  protected minimax(
    gameState: GameState,
    depth: number
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Base case
    if (depth === 0 || this.isGameOver(gameState) || this.isTimeUp()) {
      return {
        score: this.basicValue(gameState),
        nodesEvaluated,
      };
    }

    const moves = this.generateLegalMoves(gameState, gameState.currentPlayer);
    if (moves.length === 0) {
      return {
        score: this.basicValue(gameState),
        nodesEvaluated,
      };
    }

    const isMaximizing = gameState.currentPlayer === "red";
    const scores: number[] = [];

    for (const move of moves) {
      if (this.isTimeUp()) break;

      const newGameState = this.simulateMove(gameState, move);
      const result = this.minimax(newGameState, depth - 1);

      scores.push(result.score);
      nodesEvaluated += result.nodesEvaluated;
    }

    // Find min/max like Rust implementation
    const bestScore = isMaximizing ? Math.max(...scores) : Math.min(...scores);

    return { score: bestScore, nodesEvaluated };
  }

  /**
   * Alpha-beta minimax implementation
   */
  protected alphaBeta(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Base case
    if (depth === 0 || this.isGameOver(gameState) || this.isTimeUp()) {
      return {
        score: this.basicValue(gameState),
        nodesEvaluated,
      };
    }

    const moves = this.generateLegalMoves(gameState, gameState.currentPlayer);
    if (moves.length === 0) {
      return {
        score: this.basicValue(gameState),
        nodesEvaluated,
      };
    }

    const isMaximizing = gameState.currentPlayer === "red";
    let value = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      if (this.isTimeUp()) break;

      const newGameState = this.simulateMove(gameState, move);
      const result = this.alphaBeta(newGameState, depth - 1, alpha, beta);

      nodesEvaluated += result.nodesEvaluated;

      if (isMaximizing) {
        value = Math.max(value, result.score);
        alpha = Math.max(alpha, value);
        if (value >= beta) break; // Beta cutoff
      } else {
        value = Math.min(value, result.score);
        beta = Math.min(beta, value);
        if (value <= alpha) break; // Alpha cutoff
      }
    }

    return { score: value, nodesEvaluated };
  }

  /**
   * Iterative deepening Alpha-Beta with proper time management
   * This matches the Rust iterative_deepening function
   */
  protected iterativeDeepeningAlphaBeta(
    gameState: GameState,
    player: Player,
    duration: number
  ): {
    move: MoveWithMetadata;
    score: number;
    depth: number;
    nodesEvaluated: number;
  } | null {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const maxDepth = 50; // Match Rust MAX_DEPTH

    let bestResult: {
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    } | null = null;
    let totalNodes = 0;

    for (let depth = 1; depth <= maxDepth; depth++) {
      // Check for early termination (guaranteed wins/losses)
      if (bestResult && Math.abs(bestResult.score) >= 1000000) {
        break; // Found guaranteed win/loss, stop searching
      }

      // Check timeout
      if (Date.now() >= deadline) {
        break;
      }

      const result = this.alphaBetaWithDeadline(
        gameState,
        player,
        depth,
        deadline
      );
      if (result) {
        bestResult = {
          move: result.move,
          score: result.score,
          depth,
          nodesEvaluated: result.nodesEvaluated,
        };
        totalNodes += result.nodesEvaluated;

        this.emitThinkingUpdate({
          score: result.score,
          depth,
          nodesEvaluated: totalNodes,
          bestMoveFound: result.move,
        });
      } else {
        // Timeout at this depth
        break;
      }
    }

    if (bestResult) {
      bestResult.nodesEvaluated = totalNodes;
    }

    return bestResult;
  }

  /**
   * Alpha-Beta with deadline checking (matches Rust optimal_move_deadline)
   */
  protected alphaBetaWithDeadline(
    gameState: GameState,
    player: Player,
    depth: number,
    deadline: number
  ): { move: MoveWithMetadata; score: number; nodesEvaluated: number } | null {
    const timedout = () => Date.now() >= deadline;

    if (depth === 0 || timedout()) {
      return null;
    }

    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) {
      return null;
    }

    let bestMove = moves[0];
    let newGameState = this.simulateMove(gameState, bestMove);
    let bestScore = this.alphaBeta(
      newGameState,
      depth - 1,
      -Infinity,
      Infinity
    ).score;

    for (let i = 1; i < moves.length; i++) {
      if (timedout()) {
        return null;
      }

      const move = moves[i];
      newGameState = this.simulateMove(gameState, move);
      const score = this.alphaBeta(
        newGameState,
        depth - 1,
        -Infinity,
        Infinity
      ).score;

      if (player === "red" && score > bestScore) {
        bestMove = move;
        bestScore = score;
      } else if (player === "blue" && score < bestScore) {
        bestMove = move;
        bestScore = score;
      }
    }

    return { move: bestMove, score: bestScore, nodesEvaluated: 1 };
  }

  /**
   * Score all moves with iterative deepening (matches Rust moves_scored_deepening)
   */
  protected movesScoredDeepening(
    gameState: GameState,
    player: Player,
    duration: number
  ): Array<{ move: MoveWithMetadata; score: number }> | null {
    const startTime = Date.now();
    const deadline = startTime + duration;
    const maxDepth = 50;

    let bestResult: Array<{ move: MoveWithMetadata; score: number }> | null =
      null;

    for (let depth = 1; depth <= maxDepth; depth++) {
      // Check for early termination
      if (bestResult) {
        const hasGuaranteedWin = bestResult.some(
          ({ score }) => Math.abs(score) >= 1000000
        );
        if (hasGuaranteedWin) {
          break;
        }
      }

      // Check timeout
      if (Date.now() >= deadline) {
        break;
      }

      const result = this.movesScoredDeadline(
        gameState,
        player,
        depth,
        deadline
      );
      if (result) {
        bestResult = result;
      } else {
        // Timeout at this depth
        break;
      }
    }

    return bestResult;
  }

  /**
   * Score all moves at a specific depth (matches Rust moves_scored_deadline)
   */
  protected movesScoredDeadline(
    gameState: GameState,
    player: Player,
    depth: number,
    deadline: number
  ): Array<{ move: MoveWithMetadata; score: number }> | null {
    const timedout = () => Date.now() >= deadline;

    if (depth === 0 || timedout()) {
      return null;
    }

    const moves = this.generateLegalMoves(gameState, player);
    const scoredMoves: Array<{ move: MoveWithMetadata; score: number }> = [];

    for (const move of moves) {
      if (timedout()) {
        return null;
      }

      const newGameState = this.simulateMove(gameState, move);
      const score = this.alphaBeta(
        newGameState,
        depth - 1,
        -Infinity,
        Infinity
      ).score;
      scoredMoves.push({ move, score });
    }

    return scoredMoves;
  }

  /**
   * Run random simulation (for Monte Carlo algorithms)
   */
  protected runRandomSimulation(
    gameState: GameState,
    maxMoves: number = 200
  ): Player | null {
    let currentState = gameState;
    let moves = 0;

    while (moves < maxMoves) {
      const winner = checkWinConditions(currentState);
      if (winner) return winner;

      const availableMoves = this.generateLegalMoves(
        currentState,
        currentState.currentPlayer
      );

      if (availableMoves.length === 0) return null;

      const randomMove = this.selectRandomMove(availableMoves);
      currentState = this.simulateMove(currentState, randomMove);
      moves++;
    }

    return null; // Draw due to move limit
  }

  /**
   * Iterative deepening helper (for search algorithms)
   */
  protected iterativeDeepening(
    gameState: GameState,
    player: Player,
    searchFunction: (depth: number) => {
      move: MoveWithMetadata;
      score: number;
      nodesEvaluated: number;
    } | null
  ): {
    move: MoveWithMetadata;
    score: number;
    depth: number;
    nodesEvaluated: number;
  } | null {
    let bestResult: {
      move: MoveWithMetadata;
      score: number;
      depth: number;
      nodesEvaluated: number;
    } | null = null;
    let totalNodes = 0;

    for (let depth = 1; depth <= this.maxDepth && !this.isTimeUp(); depth++) {
      const result = searchFunction(depth);
      if (result) {
        bestResult = {
          move: result.move,
          score: result.score,
          depth,
          nodesEvaluated: result.nodesEvaluated,
        };
        totalNodes += result.nodesEvaluated;

        this.emitThinkingUpdate({
          score: result.score,
          depth,
          nodesEvaluated: totalNodes,
          bestMoveFound: result.move,
        });

        // Early termination for guaranteed wins/losses
        if (Math.abs(result.score) >= 1000000) break;
      }
    }

    if (bestResult) {
      bestResult.nodesEvaluated = totalNodes;
    }

    return bestResult;
  }

  // ============================================================================
  // LEGACY COMPATIBILITY (For existing algorithms)
  // ============================================================================

  /**
   * Legacy method - use basicValue instead
   * @deprecated
   */
  protected evaluateState(gameState: GameState): number {
    return this.basicValue(gameState);
  }
}
