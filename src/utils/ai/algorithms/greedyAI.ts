import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { checkWinConditions } from "@/utils/gameManager";

export class GreedyAI extends BaseAI {
  constructor() {
    super(3, 1500); // Shallow search like the Rust version
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

    // Shuffle moves for randomness (like Rust implementation)
    const shuffledMoves = [...moves].sort(() => Math.random() - 0.5);

    let bestMove = shuffledMoves[0];
    let bestScore = player === "red" ? -Infinity : Infinity;
    let totalNodesEvaluated = 0;

    // Evaluate each move using shallow minimax (depth 3 like Rust)
    for (const move of shuffledMoves) {
      const newGameState = this.simulateMove(gameState, move);
      const { score, nodesEvaluated } = this.greedyMinimax(
        newGameState,
        3, // Fixed depth like Rust version
        player
      );

      totalNodesEvaluated += nodesEvaluated;

      const isImprovement =
        player === "red" ? score > bestScore : score < bestScore;

      if (isImprovement) {
        bestMove = move;
        bestScore = score;
      }
    }

    const thinkingTime = Date.now() - startTime;

    return {
      move: bestMove,
      score: bestScore,
      depth: 3,
      nodesEvaluated: totalNodesEvaluated,
      thinkingTime,
    };
  }

  /**
   * Simple minimax for greedy evaluation (matches Rust minimax::minimax)
   */
  private greedyMinimax(
    gameState: GameState,
    depth: number,
    maximizingPlayer: Player
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Base case: leaf node
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

    // Collect all scores then find min/max (like Rust implementation)
    const scores: number[] = [];

    for (const move of moves) {
      const newGameState = this.simulateMove(gameState, move);
      const result = this.greedyMinimax(
        newGameState,
        depth - 1,
        maximizingPlayer
      );

      scores.push(result.score);
      nodesEvaluated += result.nodesEvaluated;
    }

    // Find best score based on player
    const bestScore = isMaximizing ? Math.max(...scores) : Math.min(...scores);

    return { score: bestScore, nodesEvaluated };
  }

  /**
   * Basic position evaluation (matches Rust heuristics)
   */
  private evaluatePosition(gameState: GameState, player: Player): number {
    // Check for game over first
    const winner = checkWinConditions(gameState);
    if (winner) {
      if (winner === player) {
        return 1000000; // Equivalent to i64::MAX
      } else {
        return -1000000; // Equivalent to i64::MIN
      }
    }

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

    // Value function based on piece count (from Rust heuristics.rs)
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
          return 20; // Should not happen in normal game
      }
    };

    const redValue = valueFromPawnCount(redPieces);
    const blueValue = valueFromPawnCount(bluePieces);

    // Return difference (red advantage is positive)
    return redValue - blueValue;
  }
}
