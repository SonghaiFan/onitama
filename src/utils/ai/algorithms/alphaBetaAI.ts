import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, checkWinConditions } from "@/utils/gameManager";

export class AlphaBetaAI extends BaseAI {
  constructor() {
    super(8, 4000); // Even deeper search than minimax due to pruning efficiency
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const startTime = this.startTime;

    let bestMove: MoveWithMetadata | null = null;
    let bestScore = player === "red" ? -Infinity : Infinity;
    let nodesEvaluated = 0;
    let finalDepth = 1;

    // Iterative deepening with alpha-beta pruning
    for (let depth = 1; depth <= this.maxDepth; depth++) {
      const timeElapsed = Date.now() - startTime;
      if (timeElapsed >= this.maxTime) {
        break;
      }

      // Check if we found a guaranteed win/loss in previous iteration
      if (bestMove && Math.abs(bestScore) >= 1000000) {
        break;
      }

      const result = this.findBestMoveAtDepth(gameState, player, depth);
      if (result) {
        bestMove = result.move;
        bestScore = result.score;
        nodesEvaluated += result.nodesEvaluated;
        finalDepth = depth;

        this.emitThinkingUpdate({
          score: bestScore,
          depth: finalDepth,
          nodesEvaluated,
          bestMoveFound: bestMove,
        });

        // Early termination for guaranteed wins/losses
        if (Math.abs(bestScore) >= 1000000) {
          break;
        }
      }

      // Check time again after each depth
      if (Date.now() - startTime >= this.maxTime) {
        break;
      }
    }

    if (!bestMove) {
      // Fallback to first available move
      const moves = this.generateLegalMoves(gameState, player);
      if (moves.length === 0) {
        throw new Error("No valid moves available for AI");
      }
      bestMove = moves[0];
      bestScore = 0;
      nodesEvaluated = 1;
    }

    const thinkingTime = Date.now() - startTime;

    return {
      move: bestMove,
      score: bestScore,
      depth: finalDepth,
      nodesEvaluated,
      thinkingTime,
    };
  }

  private findBestMoveAtDepth(
    gameState: GameState,
    player: Player,
    maxDepth: number
  ): { move: MoveWithMetadata; score: number; nodesEvaluated: number } | null {
    const moves = this.generateLegalMoves(gameState, player);
    if (moves.length === 0) return null;

    let bestMove = moves[0];
    let bestScore = player === "red" ? -Infinity : Infinity;
    let totalNodes = 0;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      // Check timeout
      if (Date.now() - this.startTime >= this.maxTime) {
        break;
      }

      const newGameState = this.simulateMove(gameState, move);
      const { score, nodesEvaluated } = this.alphaBetaSearch(
        newGameState,
        maxDepth - 1,
        alpha,
        beta,
        player
      );

      totalNodes += nodesEvaluated;

      const isImprovement =
        player === "red" ? score > bestScore : score < bestScore;

      if (isImprovement) {
        bestMove = move;
        bestScore = score;
      }

      // Update alpha-beta bounds for root level
      if (player === "red") {
        alpha = Math.max(alpha, bestScore);
      } else {
        beta = Math.min(beta, bestScore);
      }
    }

    return {
      move: bestMove,
      score: bestScore,
      nodesEvaluated: totalNodes,
    };
  }

  private alphaBetaSearch(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Base case: terminal node
    if (depth === 0 || this.isGameOver(gameState)) {
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
      // Timeout check
      if (Date.now() - this.startTime >= this.maxTime) {
        break;
      }

      const newGameState = this.simulateMove(gameState, move);

      const result = this.alphaBetaSearch(
        newGameState,
        depth - 1,
        alpha,
        beta,
        maximizingPlayer
      );

      nodesEvaluated += result.nodesEvaluated;

      if (isMaximizing) {
        value = Math.max(value, result.score);
        alpha = Math.max(alpha, value);

        // Alpha-beta pruning for maximizing player
        if (value >= beta) {
          break; // Beta cutoff
        }
      } else {
        value = Math.min(value, result.score);
        beta = Math.min(beta, value);

        // Alpha-beta pruning for minimizing player
        if (value <= alpha) {
          break; // Alpha cutoff
        }
      }
    }

    return { score: value, nodesEvaluated };
  }

  /**
   * Enhanced move scoring for better ordering (improves pruning efficiency)
   */
  private scoreMoveForOrdering(
    gameState: GameState,
    move: MoveWithMetadata
  ): number {
    const targetPiece = gameState.board[move.to[0]][move.to[1]];
    let score = 0;

    // Prioritize captures
    if (targetPiece && targetPiece.player !== gameState.currentPlayer) {
      score += 100;

      // Master captures are extremely valuable
      if (targetPiece.isMaster) {
        score += 10000;
      }
    }

    // Prioritize moves toward opponent's temple
    const currentPlayer = gameState.currentPlayer;
    if (currentPlayer === "red") {
      // Red wants to move toward row 0 (blue's temple)
      score += (4 - move.to[0]) * 10;
    } else {
      // Blue wants to move toward row 4 (red's temple)
      score += move.to[0] * 10;
    }

    // Prefer center control
    const centerDistance = Math.abs(move.to[0] - 2) + Math.abs(move.to[1] - 2);
    score += (4 - centerDistance) * 5;

    return score;
  }

  /**
   * Evaluate board position (same as Rust heuristics but with move ordering)
   */
  private evaluatePosition(gameState: GameState, player: Player): number {
    // Check for game over
    const winner = checkWinConditions(gameState);
    if (winner) {
      if (winner === player) {
        return 1000000; // Equivalent to i64::MAX in concept
      } else {
        return -1000000; // Equivalent to i64::MIN in concept
      }
    }

    // Count pieces for each player
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
          return 8 + 6;
        case 3:
          return 8 + 6 + 4;
        case 4:
          return 8 + 6 + 4 + 2;
        default:
          return 20;
      }
    };

    const redValue = valueFromPawnCount(redPieces);
    const blueValue = valueFromPawnCount(bluePieces);

    return redValue - blueValue;
  }
}
