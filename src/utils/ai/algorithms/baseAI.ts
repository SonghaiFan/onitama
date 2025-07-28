import { GameState, Player, Piece } from "@/types/game";
import { MoveWithMetadata, getAllPlayerMoves } from "@/utils/gameManager";
import { eventBus, AIThinkingUpdateEvent } from "@/utils/eventBus";

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
  protected startTime: number = 0;

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
   * Core Minimax algorithm with Alpha-Beta pruning and node tracking
   */
  protected minimaxWithTracking(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
    originalPlayer: Player
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Terminal conditions
    if (depth === 0 || this.isGameOver(gameState)) {
      return {
        score: this.evaluateState(gameState, originalPlayer),
        nodesEvaluated,
      };
    }

    const moves = this.generateLegalMoves(gameState, gameState.currentPlayer);

    if (maximizingPlayer) {
      // Use expectimax approach - calculate weighted average of outcomes
      let totalScore = 0;
      let totalWeight = 0;
      let maxScore = -Infinity;

      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const result = this.minimaxWithTracking(
          newState,
          depth - 1,
          alpha,
          beta,
          false,
          originalPlayer
        );

        nodesEvaluated += result.nodesEvaluated;

        // Weight the score based on move quality
        const weight = this.getMoveWeight(move, gameState);
        totalScore += result.score * weight;
        totalWeight += weight;

        maxScore = Math.max(maxScore, result.score);
        alpha = Math.max(alpha, result.score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      // Blend average score with max score (70% average, 30% max)
      const averageScore =
        totalWeight > 0 ? totalScore / totalWeight : maxScore;
      const blendedScore = averageScore * 0.7 + maxScore * 0.3;

      return { score: blendedScore, nodesEvaluated };
    } else {
      // For minimizing player, use similar expectimax approach
      let totalScore = 0;
      let totalWeight = 0;
      let minScore = Infinity;

      for (const move of moves) {
        const newState = this.simulateMove(gameState, move);
        const result = this.minimaxWithTracking(
          newState,
          depth - 1,
          alpha,
          beta,
          true,
          originalPlayer
        );

        nodesEvaluated += result.nodesEvaluated;

        const weight = this.getMoveWeight(move, gameState);
        totalScore += result.score * weight;
        totalWeight += weight;

        minScore = Math.min(minScore, result.score);
        beta = Math.min(beta, result.score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      // Blend average score with min score (70% average, 30% min)
      const averageScore =
        totalWeight > 0 ? totalScore / totalWeight : minScore;
      const blendedScore = averageScore * 0.7 + minScore * 0.3;

      return { score: blendedScore, nodesEvaluated };
    }
  }

  /**
   * Calculate weight for a move based on its characteristics
   */
  protected getMoveWeight(
    move: MoveWithMetadata,
    gameState: GameState
  ): number {
    let weight = 1.0;

    // Capturing moves get higher weight
    if (move.isCapture) {
      weight += 0.5;
    }

    // Master moves get higher weight
    const piece = gameState.board[move.from[0]][move.from[1]];
    if (piece?.isMaster) {
      weight += 0.3;
    }

    // Moves toward center get slightly higher weight
    const [toRow, toCol] = move.to;
    const distanceFromCenter = Math.abs(toRow - 2) + Math.abs(toCol - 2);
    weight += (4 - distanceFromCenter) * 0.1;

    return weight;
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
   * Find the best move using improved weighted average scoring
   */
  protected findBestMoveWithMinimax(
    gameState: GameState,
    player: Player,
    depth: number
  ): { move: MoveWithMetadata; score: number; nodesEvaluated: number } {
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // FIRST PRIORITY: Check for immediate master captures (instant win)
    const masterCaptures = moves.filter((move) => {
      if (!move.isCapture) return false;
      const targetPiece = gameState.board[move.to[0]][move.to[1]];
      return targetPiece?.isMaster === true;
    });

    if (masterCaptures.length > 0) {
      // Master capture found - this wins the game immediately!
      const winningMove = masterCaptures[0];
      this.emitThinkingUpdate({
        score: 999, // Clear winning score
        depth,
        nodesEvaluated: moves.length,
        bestMoveFound: {
          from: winningMove.from,
          to: winningMove.to,
          cardIndex: winningMove.cardIndex,
        },
      });

      return {
        move: winningMove,
        score: 999,
        nodesEvaluated: moves.length,
      };
    }

    // SECOND PRIORITY: Check for temple arch moves (also instant win)
    const templeArchMoves = moves.filter((move) => {
      const piece = gameState.board[move.from[0]][move.from[1]];
      if (!piece?.isMaster) return false;

      const [toRow, toCol] = move.to;
      if (player === "red" && toRow === 4 && toCol === 2) return true; // Red reaches blue temple
      if (player === "blue" && toRow === 0 && toCol === 2) return true; // Blue reaches red temple
      return false;
    });

    if (templeArchMoves.length > 0) {
      // Temple arch move found - this also wins!
      const winningMove = templeArchMoves[0];
      this.emitThinkingUpdate({
        score: 998, // Clear winning score
        depth,
        nodesEvaluated: moves.length,
        bestMoveFound: {
          from: winningMove.from,
          to: winningMove.to,
          cardIndex: winningMove.cardIndex,
        },
      });

      return {
        move: winningMove,
        score: 998,
        nodesEvaluated: moves.length,
      };
    }

    // THIRD PRIORITY: Check if our master is in immediate danger
    const masterSavingMoves = this.findMasterSavingMoves(
      gameState,
      player,
      moves
    );
    const priorityMoves =
      masterSavingMoves.length > 0 ? masterSavingMoves : moves;

    let bestMove = priorityMoves[0];
    let bestRelativeScore = -Infinity;
    let totalNodesEvaluated = 0;
    const moveEvaluations: Array<{
      move: MoveWithMetadata;
      aiScore: number;
      opponentScore: number;
      relativeScore: number;
      confidence: number;
    }> = [];

    for (let i = 0; i < priorityMoves.length; i++) {
      const move = priorityMoves[i];
      const newState = this.simulateMove(gameState, move);

      // Add immediate tactical bonus for capture moves
      let bonusScore = 0;
      if (move.isCapture) {
        bonusScore += 500; // High bonus for any capture
      }

      // Calculate AI's score for this position
      const aiResult = this.minimaxWithTracking(
        newState,
        depth - 1,
        -Infinity,
        Infinity,
        false, // Next turn is opponent (minimizing)
        player
      );
      const aiScore = aiResult.score + bonusScore;
      totalNodesEvaluated += aiResult.nodesEvaluated;

      // Calculate opponent's average score from this position
      const opponentScore = this.calculateOpponentAverageScore(
        newState,
        player === "red" ? "blue" : "red",
        depth - 1
      );
      totalNodesEvaluated += opponentScore.nodesEvaluated;

      // Calculate relative score: AI advantage - Opponent advantage
      const relativeScore = aiScore - opponentScore.averageScore;

      // Calculate confidence based on search depth and node count
      const confidence = Math.min(
        1.0,
        (aiResult.nodesEvaluated + opponentScore.nodesEvaluated) / (depth * 20)
      );

      moveEvaluations.push({
        move,
        aiScore,
        opponentScore: opponentScore.averageScore,
        relativeScore,
        confidence,
      });

      if (relativeScore > bestRelativeScore) {
        bestRelativeScore = relativeScore;
        bestMove = move;
      }

      // Emit frequent updates to show dynamic thinking (every 2-3 moves)
      if (
        i % Math.max(1, Math.floor(priorityMoves.length / 4)) === 0 ||
        i === priorityMoves.length - 1
      ) {
        // Calculate average relative score of all evaluated moves so far
        const avgAiScore =
          moveEvaluations.length > 0
            ? moveEvaluations.reduce(
                (sum, evaluation) => sum + evaluation.aiScore,
                0
              ) / moveEvaluations.length
            : 0;

        const avgOpponentScore =
          moveEvaluations.length > 0
            ? moveEvaluations.reduce(
                (sum, evaluation) => sum + evaluation.opponentScore,
                0
              ) / moveEvaluations.length
            : 0;

        const avgRelativeScore = avgAiScore - avgOpponentScore;

        this.emitThinkingUpdate({
          score: avgRelativeScore,
          depth,
          nodesEvaluated: totalNodesEvaluated,
          bestMoveFound: {
            from: bestMove.from,
            to: bestMove.to,
            cardIndex: bestMove.cardIndex,
          },
        });
      }
    }

    // Calculate final average relative score of all moves
    const finalAvgAiScore =
      moveEvaluations.length > 0
        ? moveEvaluations.reduce(
            (sum, evaluation) => sum + evaluation.aiScore,
            0
          ) / moveEvaluations.length
        : 0;

    const finalAvgOpponentScore =
      moveEvaluations.length > 0
        ? moveEvaluations.reduce(
            (sum, evaluation) => sum + evaluation.opponentScore,
            0
          ) / moveEvaluations.length
        : 0;

    const finalRelativeScore = finalAvgAiScore - finalAvgOpponentScore;

    return {
      move: bestMove,
      score: finalRelativeScore, // Return relative score (AI avg - Opponent avg)
      nodesEvaluated: totalNodesEvaluated,
    };
  }

  /**
   * Calculate opponent's average score across all their possible moves from a given position
   */
  protected calculateOpponentAverageScore(
    gameState: GameState,
    opponent: Player,
    depth: number
  ): { averageScore: number; nodesEvaluated: number } {
    if (depth <= 0 || this.isGameOver(gameState)) {
      return {
        averageScore: this.evaluateState(gameState, opponent),
        nodesEvaluated: 1,
      };
    }

    const opponentMoves = this.generateLegalMoves(gameState, opponent);

    if (opponentMoves.length === 0) {
      return {
        averageScore: this.evaluateState(gameState, opponent),
        nodesEvaluated: 1,
      };
    }

    let totalScore = 0;
    let totalNodesEvaluated = 0;

    for (const move of opponentMoves) {
      const newState = this.simulateMove(gameState, move);

      // Add immediate tactical bonus for opponent's capture moves
      let bonusScore = 0;
      if (move.isCapture) {
        bonusScore += 500;
      }

      const result = this.minimaxWithTracking(
        newState,
        depth - 1,
        -Infinity,
        Infinity,
        false, // Still minimizing from opponent's perspective
        opponent
      );

      totalScore += result.score + bonusScore;
      totalNodesEvaluated += result.nodesEvaluated;
    }

    return {
      averageScore: totalScore / opponentMoves.length,
      nodesEvaluated: totalNodesEvaluated,
    };
  }

  /**
   * Find moves that save the master from immediate capture
   */
  protected findMasterSavingMoves(
    gameState: GameState,
    player: Player,
    allMoves: MoveWithMetadata[]
  ): MoveWithMetadata[] {
    const opponent = player === "red" ? "blue" : "red";

    // Check if master is currently threatened
    const playerMaster = this.findMaster(gameState.board, player);
    if (!playerMaster) return [];

    // Simulate each opponent move to see if they can capture our master
    const opponentMoves = this.generateLegalMoves(gameState, opponent);
    const masterThreats = opponentMoves.filter((move) => {
      return (
        move.isCapture &&
        move.to[0] === playerMaster.position[0] &&
        move.to[1] === playerMaster.position[1]
      );
    });

    if (masterThreats.length === 0) return []; // Master not in danger

    // Find moves that either move the master or block the threat
    return allMoves.filter((move) => {
      const piece = gameState.board[move.from[0]][move.from[1]];

      // Moving the master to safety
      if (piece?.isMaster) return true;

      // Capturing the threatening piece
      if (move.isCapture) {
        return masterThreats.some(
          (threat) =>
            threat.from[0] === move.to[0] && threat.from[1] === move.to[1]
        );
      }

      return false;
    });
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

    // Master captured - only return extreme values for actual game-ending conditions
    if (!playerMaster) return -10000;
    if (!opponentMaster) return 10000;

    // Temple arch reached - only if the game is actually over
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

    // If we get here, it's a normal game position - calculate incremental score

    // Material count (more pieces = better)
    const playerPieces = this.getPieceCount(gameState.board, player);
    const opponentPieces = this.getPieceCount(gameState.board, opponent);
    score += (playerPieces - opponentPieces) * 150;

    // Master position value (progress toward opponent temple)
    const masterProgress = this.getMasterPositionValue(playerMaster, player);
    const oppMasterProgress = this.getMasterPositionValue(
      opponentMaster,
      opponent
    );
    score += masterProgress - oppMasterProgress;

    // Center control
    score += this.getCenterControl(gameState.board, player) * 25;
    score -= this.getCenterControl(gameState.board, opponent) * 25;

    // Master safety (being threatened is bad)
    const masterSafety = this.evaluateMasterSafety(gameState, player);
    const oppMasterSafety = this.evaluateMasterSafety(gameState, opponent);
    score += masterSafety - oppMasterSafety;

    // Add tactical bonuses for strong positions
    score += this.evaluateTacticalPosition(gameState, player);
    score -= this.evaluateTacticalPosition(gameState, opponent);

    // Add some controlled randomness to avoid repetitive play
    score += (Math.random() - 0.5) * 20;

    // Clamp the score to reasonable bounds for non-terminal positions
    score = Math.max(-2000, Math.min(2000, score));

    return score;
  }

  /**
   * Evaluate tactical aspects of the position
   */
  protected evaluateTacticalPosition(
    gameState: GameState,
    player: Player
  ): number {
    let tacticalScore = 0;

    // Count pieces that can capture opponent pieces next turn
    const moves = this.generateLegalMoves(gameState, player);
    const captureMoves = moves.filter((move) => move.isCapture);
    tacticalScore += captureMoves.length * 30;

    // Bonus for having multiple move options (flexibility)
    tacticalScore += Math.min(moves.length * 5, 50);

    return tacticalScore;
  }

  /**
   * Evaluate master position value
   */
  protected getMasterPositionValue(master: Piece, player: Player): number {
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
  protected evaluateMasterSafety(gameState: GameState, player: Player): number {
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
