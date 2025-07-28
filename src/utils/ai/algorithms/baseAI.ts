import { GameState, Player, Piece } from "@/types/game";
import { MoveWithMetadata, getAllPlayerMoves } from "@/utils/gameManager";

export interface AIMoveResult {
  move: MoveWithMetadata;
  score: number;
  depth: number;
  nodesEvaluated: number;
  thinkingTime: number;
}

export abstract class BaseAI {
  protected maxDepth: number;
  protected maxTime: number; // milliseconds

  constructor(maxDepth: number = 4, maxTime: number = 5000) {
    this.maxDepth = maxDepth;
    this.maxTime = maxTime;
  }

  /**
   * Main method to find the best move
   */
  abstract findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult>;

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
   * Simulate a move and return new game state with proper deep copying
   */
  protected simulateMove(
    gameState: GameState,
    move: MoveWithMetadata
  ): GameState {
    // Create a completely deep copy of the game state
    const newState: GameState = this.deepCopyGameState(gameState);

    // Apply the move to the new state
    const fromPiece = newState.board[move.from[0]][move.from[1]];

    if (fromPiece) {
      // Move the piece
      newState.board[move.to[0]][move.to[1]] = { ...fromPiece };
      newState.board[move.from[0]][move.from[1]] = null;

      // Handle card exchange - this is the critical part
      const currentPlayer = newState.currentPlayer;
      const playerState = newState.players[currentPlayer];

      // Get the used card (make a copy)
      const usedCard = { ...playerState.cards[move.cardIndex] };

      // Get the shared card (make a copy)
      const newSharedCard = newState.sharedCard
        ? { ...newState.sharedCard }
        : null;

      // Exchange cards: used card becomes shared, shared card goes to player
      newState.sharedCard = usedCard;
      if (newSharedCard) {
        playerState.cards[move.cardIndex] = newSharedCard;
      }

      // Switch current player
      newState.currentPlayer = currentPlayer === "red" ? "blue" : "red";
    }

    return newState;
  }

  /**
   * Create a complete deep copy of game state
   */
  protected deepCopyGameState(gameState: GameState): GameState {
    return {
      ...gameState,
      board: gameState.board.map((row) =>
        row.map((piece) => (piece ? { ...piece } : null))
      ),
      players: {
        red: {
          ...gameState.players.red,
          cards: gameState.players.red.cards.map((card) => ({ ...card })),
        },
        blue: {
          ...gameState.players.blue,
          cards: gameState.players.blue.cards.map((card) => ({ ...card })),
        },
      },
      sharedCard: gameState.sharedCard
        ? { ...gameState.sharedCard }
        : gameState.sharedCard,
      currentPlayer: gameState.currentPlayer,
    };
  }

  /**
   * Check if the game is over
   */
  protected isGameOver(gameState: GameState): boolean {
    // Check if either player has won
    const redMaster = this.findMaster(gameState.board, "red");
    const blueMaster = this.findMaster(gameState.board, "blue");

    // Check temple arch captures
    if (!redMaster || !blueMaster) return true;

    // Check if red master reached blue's temple arch
    if (redMaster.position[0] === 4 && redMaster.position[1] === 2) return true;

    // Check if blue master reached red's temple arch
    if (blueMaster.position[0] === 0 && blueMaster.position[1] === 2)
      return true;

    return false;
  }

  /**
   * Find master piece for a player
   */
  protected findMaster(
    board: (Piece | null)[][],
    player: Player
  ): Piece | null {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player && piece.isMaster) {
          return { ...piece, position: [row, col] };
        }
      }
    }
    return null;
  }

  /**
   * Core Minimax algorithm with Alpha-Beta pruning
   */
  protected minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
    originalPlayer: Player
  ): number {
    // Terminal conditions
    if (depth === 0 || this.isGameOver(gameState)) {
      return this.evaluateState(gameState, originalPlayer);
    }

    const moves = this.generateLegalMoves(gameState, gameState.currentPlayer);

    if (maximizingPlayer) {
      let maxScore = -Infinity;

      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const score = this.minimax(
          newState,
          depth - 1,
          alpha,
          beta,
          false,
          originalPlayer
        );

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const score = this.minimax(
          newState,
          depth - 1,
          alpha,
          beta,
          true,
          originalPlayer
        );

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      return minScore;
    }
  }

  /**
   * Find the best move using Minimax algorithm
   */
  protected findBestMoveWithMinimax(
    gameState: GameState,
    player: Player,
    depth: number
  ): { move: MoveWithMetadata; score: number } {
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    let bestScore = -Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      const newState = this.simulateMove(gameState, move);
      const score = this.minimax(
        newState,
        depth - 1,
        -Infinity,
        Infinity,
        false, // Next turn is opponent (minimizing)
        player
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return { move: bestMove, score: bestScore };
  }

  /**
   * Evaluate game state from a player's perspective
   */
  protected evaluateState(gameState: GameState, player: Player): number {
    let score = 0;
    const opponent = player === "red" ? "blue" : "red";

    // Check for immediate win/loss conditions
    const playerMaster = this.findMaster(gameState.board, player);
    const opponentMaster = this.findMaster(gameState.board, opponent);

    // Master captured
    if (!playerMaster) return -10000;
    if (!opponentMaster) return 10000;

    // Temple arch reached
    const [masterRow, masterCol] = playerMaster.position;
    const [oppMasterRow, oppMasterCol] = opponentMaster.position;

    // Check if player's master reached opponent's temple arch
    if (player === "red" && masterRow === 4 && masterCol === 2) return 10000;
    if (player === "blue" && masterRow === 0 && masterCol === 2) return 10000;

    // Check if opponent's master reached player's temple arch
    if (opponent === "red" && oppMasterRow === 4 && oppMasterCol === 2)
      return -10000;
    if (opponent === "blue" && oppMasterRow === 0 && oppMasterCol === 2)
      return -10000;

    // Material count
    const playerPieces = this.getPieceCount(gameState.board, player);
    const opponentPieces = this.getPieceCount(gameState.board, opponent);
    score += (playerPieces - opponentPieces) * 100;

    // Master position value
    score += this.getMasterPositionValue(playerMaster, player);
    score -= this.getMasterPositionValue(opponentMaster, opponent);

    // Center control
    score += this.getCenterControl(gameState.board, player) * 20;
    score -= this.getCenterControl(gameState.board, opponent) * 20;

    // Master safety
    score += this.evaluateMasterSafety(gameState, player);
    score -= this.evaluateMasterSafety(gameState, opponent);

    return score;
  }

  /**
   * Evaluate master position value
   */
  private getMasterPositionValue(master: Piece, player: Player): number {
    const [row, col] = master.position;
    let value = 0;

    // Progress toward opponent's temple arch
    if (player === "red") {
      value += (4 - row) * 50; // Red moves down
      if (row >= 3) value += 100; // Close to goal
    } else {
      value += row * 50; // Blue moves up
      if (row <= 1) value += 100; // Close to goal
    }

    // Center column bonus
    if (col === 2) value += 30;

    return value;
  }

  /**
   * Evaluate master safety
   */
  private evaluateMasterSafety(gameState: GameState, player: Player): number {
    const master = this.findMaster(gameState.board, player);
    if (!master) return -1000;

    let safety = 0;
    const [masterRow, masterCol] = master.position;

    // Count friendly pieces nearby
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;

        const newRow = masterRow + dr;
        const newCol = masterCol + dc;

        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
          const piece = gameState.board[newRow][newCol];
          if (piece && piece.player === player && !piece.isMaster) {
            safety += 15;
          }
        }
      }
    }

    return safety;
  }

  /**
   * Get piece count for a player
   */
  protected getPieceCount(board: (Piece | null)[][], player: Player): number {
    let count = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = board[row][col];
        if (piece && piece.player === player) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Calculate distance between two positions
   */
  protected calculateDistance(
    pos1: [number, number],
    pos2: [number, number]
  ): number {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
  }

  /**
   * Get center control score
   */
  protected getCenterControl(
    board: (Piece | null)[][],
    player: Player
  ): number {
    const centerPositions: [number, number][] = [
      [2, 2], // center
      [1, 2],
      [2, 1],
      [2, 3],
      [3, 2], // adjacent to center
    ];

    let score = 0;
    for (const [row, col] of centerPositions) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        score += piece.isMaster ? 3 : 1;
      }
    }
    return score;
  }
}
