import { GameState, Player, MoveCard, Piece } from "@/types/game";
import {
  getAllPossibleMoves,
  executeMove,
  checkWinConditions,
} from "./gameManager";

export interface AIMove {
  from: [number, number];
  to: [number, number];
  cardIndex: number;
  score?: number;
}

export interface AIConfig {
  difficulty: "easy" | "medium" | "hard";
  maxDepth?: number;
  simulationCount?: number;
  timeLimit?: number; // milliseconds
}

// Default AI configurations with Minimax depths
export const AI_CONFIGS = {
  easy: {
    difficulty: "easy" as const,
    maxDepth: 2,
    simulationCount: 100,
    timeLimit: 1000,
  },
  medium: {
    difficulty: "medium" as const,
    maxDepth: 3,
    simulationCount: 500,
    timeLimit: 2000,
  },
  hard: {
    difficulty: "hard" as const,
    maxDepth: 4,
    simulationCount: 1000,
    timeLimit: 3000,
  },
};

class AIManager {
  private isInitialized = false;
  private moveCache = new Map<string, AIMove>();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log("Minimax AI initialized");
  }

  // Generate AI move using Minimax with Alpha-Beta pruning
  async generateMove(
    gameState: GameState,
    config: AIConfig
  ): Promise<AIMove | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const timeLimit = config.timeLimit || 2000;
    const maxDepth = config.maxDepth || 3;

    // Generate all possible moves
    const possibleMoves = this.generateAllLegalMoves(gameState);

    if (possibleMoves.length === 0) return null;

    // Add randomness based on difficulty
    const randomness =
      config.difficulty === "easy"
        ? 0.7
        : config.difficulty === "medium"
        ? 0.3
        : 0.1;

    // If random move should be made
    if (Math.random() < randomness) {
      const topMoves = possibleMoves.slice(
        0,
        Math.max(1, Math.floor(possibleMoves.length * 0.3))
      );
      return topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    // Sort moves for better Alpha-Beta pruning efficiency
    const sortedMoves = this.sortMovesByHeuristic(gameState, possibleMoves);

    let bestMove: AIMove | null = null;
    let bestScore = gameState.currentPlayer === "red" ? -Infinity : Infinity;

    // Iterative deepening for better time management
    for (let depth = 1; depth <= maxDepth; depth++) {
      let currentBestMove: AIMove | null = null;
      let currentBestScore =
        gameState.currentPlayer === "red" ? -Infinity : Infinity;

      for (const move of sortedMoves) {
        // Check time limit
        if (Date.now() - startTime > timeLimit * 0.8) {
          console.log(`AI time limit approaching, stopping at depth ${depth}`);
          break;
        }

        const newState = this.simulateMove(gameState, move);
        const score = this.minimax(
          newState,
          depth - 1,
          -Infinity,
          Infinity,
          gameState.currentPlayer === "red" ? false : true // Next player
        );

        if (gameState.currentPlayer === "red") {
          if (score > currentBestScore) {
            currentBestScore = score;
            currentBestMove = move;
          }
        } else {
          if (score < currentBestScore) {
            currentBestScore = score;
            currentBestMove = move;
          }
        }
      }

      // Update best move if we found a better one
      if (currentBestMove) {
        bestMove = currentBestMove;
        bestScore = currentBestScore;
        bestMove.score = bestScore;
      }

      // If we're running out of time, stop
      if (Date.now() - startTime > timeLimit * 0.9) {
        console.log(`AI time limit reached at depth ${depth}`);
        break;
      }
    }

    return bestMove;
  }

  // Minimax algorithm with Alpha-Beta pruning
  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean
  ): number {
    // Terminal conditions
    if (depth === 0 || this.isGameOver(gameState)) {
      return this.evaluatePosition(
        gameState,
        maximizingPlayer ? "red" : "blue"
      );
    }

    const possibleMoves = this.generateAllLegalMoves(gameState);

    if (maximizingPlayer) {
      let maxEval = -Infinity;

      for (const move of possibleMoves) {
        const newState = this.simulateMove(gameState, move);
        const evaluation = this.minimax(
          newState,
          depth - 1,
          alpha,
          beta,
          false
        );
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;

      for (const move of possibleMoves) {
        const newState = this.simulateMove(gameState, move);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
      return minEval;
    }
  }

  // Generate all legal moves for current player
  private generateAllLegalMoves(gameState: GameState): AIMove[] {
    const moves: AIMove[] = [];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.player === gameState.currentPlayer) {
          // Check each card
          for (
            let cardIndex = 0;
            cardIndex < gameState.players[gameState.currentPlayer].cards.length;
            cardIndex++
          ) {
            const possibleMoves = getAllPossibleMoves(
              gameState,
              [row, col],
              cardIndex
            );

            for (const [toRow, toCol] of possibleMoves) {
              moves.push({
                from: [row, col],
                to: [toRow, toCol],
                cardIndex,
                score: 0,
              });
            }
          }
        }
      }
    }

    return moves;
  }

  // Simulate a move and return new game state (deep copy)
  private simulateMove(gameState: GameState, move: AIMove): GameState {
    // Deep copy the game state
    const newState: GameState = {
      ...gameState,
      board: gameState.board.map((row) =>
        row.map((cell) => (cell ? { ...cell } : null))
      ),
      players: {
        red: {
          ...gameState.players.red,
          cards: [...gameState.players.red.cards],
        },
        blue: {
          ...gameState.players.blue,
          cards: [...gameState.players.blue.cards],
        },
      },
      sharedCard: { ...gameState.sharedCard },
      windSpiritPosition: gameState.windSpiritPosition
        ? [...gameState.windSpiritPosition]
        : null,
      selectedPiece: null,
      selectedCard: null,
      winner: null,
      gamePhase: gameState.gamePhase,
      cardPacks: gameState.cardPacks ? [...gameState.cardPacks] : undefined,
      isDualMoveInProgress: false,
      firstMove: undefined,
    };

    // Execute the move
    return executeMove(newState, move.from, move.to, move.cardIndex);
  }

  // Check if game is over
  private isGameOver(gameState: GameState): boolean {
    return gameState.winner !== null || gameState.gamePhase === "finished";
  }

  // Enhanced position evaluation for Minimax
  evaluatePosition(gameState: GameState, player: Player): number {
    let score = 0;

    // Check for immediate win/loss
    const winner = checkWinConditions(gameState);
    if (winner === player) {
      return 10000; // Win
    } else if (winner && winner !== player) {
      return -10000; // Loss
    }

    // Count pieces and their values
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = gameState.board[row][col];
        if (piece) {
          if (piece.player === player) {
            if (piece.isMaster) score += 1000;
            else if (piece.isWindSpirit) score += 200;
            else score += 100;
          } else if (piece.player !== "neutral") {
            if (piece.isMaster) score -= 1000;
            else if (piece.isWindSpirit) score -= 200;
            else score -= 100;
          }
        }
      }
    }

    // Master positioning bonus
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.isMaster && piece.player === player) {
          // Bonus for being close to opponent's temple
          if (player === "red") {
            score += (row - 2) * 50; // Moving down toward blue's temple
            if (row === 4 && col === 2) score += 500; // Victory position
          } else {
            score += (2 - row) * 50; // Moving up toward red's temple
            if (row === 0 && col === 2) score += 500; // Victory position
          }
        }
      }
    }

    // Center control bonus
    for (let row = 1; row < 4; row++) {
      for (let col = 1; col < 4; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.player === player) {
          score += 10; // Center control
        }
      }
    }

    // Tactical positioning
    score += this.evaluateTacticalPosition(gameState, player);

    // Card advantage (simplified)
    const playerCards = gameState.players[player].cards.length;
    const opponentCards =
      gameState.players[player === "red" ? "blue" : "red"].cards.length;
    score += (playerCards - opponentCards) * 20;

    return score;
  }

  // Sort moves by heuristic for better Alpha-Beta pruning
  private sortMovesByHeuristic(
    gameState: GameState,
    moves: AIMove[]
  ): AIMove[] {
    return moves.sort((a, b) => {
      const scoreA = this.quickMoveEvaluation(gameState, a);
      const scoreB = this.quickMoveEvaluation(gameState, b);
      return scoreB - scoreA; // Higher scores first
    });
  }

  // Quick move evaluation for move ordering
  private quickMoveEvaluation(gameState: GameState, move: AIMove): number {
    let score = 0;
    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    const piece = gameState.board[fromRow][fromCol];
    const targetPiece = gameState.board[toRow][toCol];

    if (!piece) return 0;

    // Capture bonus
    if (targetPiece && targetPiece.player !== gameState.currentPlayer) {
      if (targetPiece.isMaster) score += 1000;
      else if (targetPiece.isWindSpirit) score += 200;
      else score += 100;
    }

    // Master advancement
    if (piece.isMaster) {
      if (gameState.currentPlayer === "red") {
        score += (toRow - fromRow) * 50; // Moving down
      } else {
        score += (fromRow - toRow) * 50; // Moving up
      }
    }

    // Wind spirit moves
    if (piece.isWindSpirit) {
      score += 50;
    }

    return score;
  }

  // Evaluate tactical positioning
  private evaluateTacticalPosition(
    gameState: GameState,
    player: Player
  ): number {
    let score = 0;

    // Piece protection and coordination
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.player === player) {
          // Check adjacent positions for protection
          const adjacentPositions = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1],
          ];

          for (const [adjRow, adjCol] of adjacentPositions) {
            if (adjRow >= 0 && adjRow < 5 && adjCol >= 0 && adjCol < 5) {
              const adjPiece = gameState.board[adjRow][adjCol];
              if (adjPiece && adjPiece.player === player) {
                score += 5; // Protection bonus
              }
            }
          }

          // Special bonus for wind spirit positioning
          if (piece.isWindSpirit) {
            score += 30; // Wind spirits are valuable
          }
        }
      }
    }

    return score;
  }

  // Clean up resources
  destroy(): void {
    this.isInitialized = false;
    this.moveCache.clear();
  }
}

// Export singleton instance
export const aiManager = new AIManager();
