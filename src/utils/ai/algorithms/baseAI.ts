import { GameState, Player, Piece } from "@/types/game";
import { MoveWithMetadata, getAllPlayerMoves } from "@/utils/gameManager";
import { eventBus, AIThinkingUpdateEvent } from "@/utils/eventBus";
import { AITacticalConfig } from "@/types/aiTactical";
import { loadTacticalConfig, TacticalPreset } from "../tacticalConfigLoader";

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
  protected tacticalConfig: AITacticalConfig | null = null;

  constructor(maxDepth: number = 4, maxTime: number = 5000) {
    this.maxDepth = maxDepth;
    this.maxTime = maxTime;
  }

  /**
   * Initialize AI with a tactical configuration preset
   */
  async initialize(preset: TacticalPreset = "default"): Promise<void> {
    this.tacticalConfig = await loadTacticalConfig(preset);
  }

  /**
   * Set custom tactical configuration
   */
  setTacticalConfig(config: AITacticalConfig): void {
    this.tacticalConfig = config;
  }

  /**
   * Get tactical configuration, loading default if not set
   */
  protected async getTacticalConfig(): Promise<AITacticalConfig> {
    if (!this.tacticalConfig) {
      this.tacticalConfig = await loadTacticalConfig("default");
    }
    return this.tacticalConfig;
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
    originalPlayer: Player,
    config: AITacticalConfig
  ): { score: number; nodesEvaluated: number } {
    let nodesEvaluated = 1;

    // Terminal conditions
    if (depth === 0 || this.isGameOver(gameState)) {
      return {
        score: this.evaluateState(gameState, originalPlayer, config),
        nodesEvaluated
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
          originalPlayer,
          config
        );

        nodesEvaluated += result.nodesEvaluated;
        
        // Weight the score based on move quality
        const weight = this.getMoveWeight(move, gameState, config);
        totalScore += result.score * weight;
        totalWeight += weight;
        
        maxScore = Math.max(maxScore, result.score);
        alpha = Math.max(alpha, result.score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      // Blend average score with max score using config
      const averageScore = totalWeight > 0 ? totalScore / totalWeight : maxScore;
      const blendedScore = averageScore * config.algorithm.expectimax.averageWeight + 
                          maxScore * config.algorithm.expectimax.extremeWeight;

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
          originalPlayer,
          config
        );

        nodesEvaluated += result.nodesEvaluated;
        
        const weight = this.getMoveWeight(move, gameState, config);
        totalScore += result.score * weight;
        totalWeight += weight;
        
        minScore = Math.min(minScore, result.score);
        beta = Math.min(beta, result.score);

        // Alpha-Beta pruning
        if (beta <= alpha) {
          break;
        }
      }

      // Blend average score with min score using config
      const averageScore = totalWeight > 0 ? totalScore / totalWeight : minScore;
      const blendedScore = averageScore * config.algorithm.expectimax.averageWeight + 
                          minScore * config.algorithm.expectimax.extremeWeight;

      return { score: blendedScore, nodesEvaluated };
    }
  }

  /**
   * Calculate weight for a move based on its characteristics
   */
  protected getMoveWeight(move: MoveWithMetadata, gameState: GameState, config: AITacticalConfig): number {
    const weights = config.evaluation.moveWeighting;
    
    let weight = weights.baseWeight;
    
    // Capturing moves get higher weight
    if (move.isCapture) {
      weight += weights.captureWeight;
    }
    
    // Master moves get higher weight
    const piece = gameState.board[move.from[0]][move.from[1]];
    if (piece?.isMaster) {
      weight += weights.masterMoveWeight;
    }
    
    // Moves toward center get slightly higher weight
    const [toRow, toCol] = move.to;
    const distanceFromCenter = Math.abs(toRow - 2) + Math.abs(toCol - 2);
    weight += (weights.maxCenterDistance - distanceFromCenter) * weights.centerWeight;
    
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
    originalPlayer: Player,
    config: AITacticalConfig
  ): number {
    // Terminal conditions
    if (depth === 0 || this.isGameOver(gameState)) {
      return this.evaluateState(gameState, originalPlayer, config);
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
          originalPlayer,
          config
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
          originalPlayer,
          config
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
  protected async findBestMoveWithMinimax(
    gameState: GameState,
    player: Player,
    depth: number
  ): Promise<{ move: MoveWithMetadata; score: number; nodesEvaluated: number }> {
    const config = await this.getTacticalConfig();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // FIRST PRIORITY: Check for immediate master captures (instant win)
    const masterCaptures = moves.filter(move => {
      if (!move.isCapture) return false;
      const targetPiece = gameState.board[move.to[0]][move.to[1]];
      return targetPiece?.isMaster === true;
    });

    if (masterCaptures.length > 0) {
      // Master capture found - this wins the game immediately!
      const winningMove = masterCaptures[0];
      this.emitThinkingUpdate({
        score: config.evaluation.terminal.masterCapturePriority, // Clear winning score
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
        score: config.evaluation.terminal.masterCapturePriority, 
        nodesEvaluated: moves.length 
      };
    }

    // SECOND PRIORITY: Check for temple arch moves (also instant win)
    const templeArchMoves = moves.filter(move => {
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
        score: config.evaluation.terminal.templeArchPriority, // Clear winning score
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
        score: config.evaluation.terminal.templeArchPriority, 
        nodesEvaluated: moves.length 
      };
    }

    // THIRD PRIORITY: Check if our master is in immediate danger
    const masterSavingMoves = this.findMasterSavingMoves(gameState, player, moves);
    const priorityMoves = masterSavingMoves.length > 0 ? masterSavingMoves : moves;

    let bestMove = priorityMoves[0];
    let bestWeightedScore = -Infinity;
    let totalNodesEvaluated = 0;
    const moveEvaluations: Array<{ move: MoveWithMetadata; weightedScore: number; confidence: number }> = [];

    for (let i = 0; i < priorityMoves.length; i++) {
      const move = priorityMoves[i];
      const newState = this.simulateMove(gameState, move);
      
      // Add immediate tactical bonus for capture moves
      let bonusScore = 0;
      if (move.isCapture) {
        bonusScore += config.evaluation.tactical.captureBonus; // High bonus for any capture
      }
      
      // Get weighted average evaluation instead of just max
      const result = this.minimaxWithTracking(
        newState,
        depth - 1,
        -Infinity,
        Infinity,
        false, // Next turn is opponent (minimizing)
        player,
        config
      );

      const finalScore = result.score + bonusScore;
      totalNodesEvaluated += result.nodesEvaluated;
      
      // Calculate confidence based on search depth and node count
      const confidence = Math.min(config.algorithm.search.confidenceCalculation.maxConfidence, 
                                 result.nodesEvaluated / (depth * config.algorithm.search.confidenceCalculation.base));
      
      moveEvaluations.push({
        move,
        weightedScore: finalScore,
        confidence
      });

      if (finalScore > bestWeightedScore) {
        bestWeightedScore = finalScore;
        bestMove = move;
        
        // Emit progress update with current best evaluation
        this.emitThinkingUpdate({
          score: this.normalizeScoreForDisplay(finalScore, config),
          depth,
          nodesEvaluated: totalNodesEvaluated,
          bestMoveFound: {
            from: bestMove.from,
            to: bestMove.to,
            cardIndex: bestMove.cardIndex,
          },
        });
      }

      // Emit frequent updates to show dynamic thinking (every 2-3 moves)
      if (i % Math.max(1, Math.floor(priorityMoves.length / config.algorithm.search.updateFrequency)) === 0 || i === priorityMoves.length - 1) {
        // Calculate current position evaluation for more responsive scoring
        const currentStateScore = this.evaluateState(gameState, player, config);
        const progressScore = moveEvaluations.length > 0 ? 
          moveEvaluations.reduce((sum, evaluation) => sum + evaluation.weightedScore, 0) / moveEvaluations.length :
          currentStateScore;
          
        this.emitThinkingUpdate({
          score: this.normalizeScoreForDisplay(progressScore, config),
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

    return { 
      move: bestMove, 
      score: this.normalizeScoreForDisplay(bestWeightedScore, config), 
      nodesEvaluated: totalNodesEvaluated 
    };
  }

  /**
   * Find moves that save the master from immediate capture
   */
  protected findMasterSavingMoves(gameState: GameState, player: Player, allMoves: MoveWithMetadata[]): MoveWithMetadata[] {
    const opponent = player === "red" ? "blue" : "red";
    
    // Check if master is currently threatened
    const playerMaster = this.findMaster(gameState.board, player);
    if (!playerMaster) return [];
    
    // Simulate each opponent move to see if they can capture our master
    const opponentMoves = this.generateLegalMoves(gameState, opponent);
    const masterThreats = opponentMoves.filter(move => {
      return move.isCapture && 
             move.to[0] === playerMaster.position[0] && 
             move.to[1] === playerMaster.position[1];
    });
    
    if (masterThreats.length === 0) return []; // Master not in danger
    
    // Find moves that either move the master or block the threat
    return allMoves.filter(move => {
      const piece = gameState.board[move.from[0]][move.from[1]];
      
      // Moving the master to safety
      if (piece?.isMaster) return true;
      
      // Capturing the threatening piece
      if (move.isCapture) {
        return masterThreats.some(threat => 
          threat.from[0] === move.to[0] && threat.from[1] === move.to[1]
        );
      }
      
      return false;
    });
  }

  /**
   * Normalize extreme scores for better display in UI
   */
  protected normalizeScoreForDisplay(score: number, config: AITacticalConfig): number {
    const display = config.evaluation.scoreDisplay;
    
    // For immediate wins/losses, show clear confidence
    if (score >= config.evaluation.terminal.masterCapturePriority) {
      return display.clearWin.min + Math.random() * (display.clearWin.max - display.clearWin.min);
    }
    if (score <= -config.evaluation.terminal.masterCapturePriority) {
      return display.clearLoss.min + Math.random() * (display.clearLoss.max - display.clearLoss.min);
    }
    
    // For high advantage positions
    if (score >= display.strongAdvantageThreshold) {
      return display.strongAdvantage.min + (score - display.strongAdvantageThreshold) / display.strongAdvantageScaling;
    }
    if (score <= -display.strongAdvantageThreshold) {
      return display.strongDisadvantage.min - (Math.abs(score) - display.strongAdvantageThreshold) / display.strongAdvantageScaling;
    }
    
    // For normal game positions, use a more dynamic range
    const baseScore = Math.max(display.normalRange.min, 
                              Math.min(display.normalRange.max, score * display.normalScaling));
    
    // Add some variance to show the AI is actively thinking
    const variance = (Math.random() - 0.5) * display.variance;
    
    return baseScore + variance;
  }

  /**
   * Evaluate game state from a player's perspective
   */
  protected evaluateState(gameState: GameState, player: Player, config: AITacticalConfig): number {
    let score = 0;
    const opponent = player === "red" ? "blue" : "red";

    // Check for immediate win/loss conditions
    const playerMaster = this.findMaster(gameState.board, player);
    const opponentMaster = this.findMaster(gameState.board, opponent);

    // Master captured - only return extreme values for actual game-ending conditions
    if (!playerMaster) return -config.evaluation.terminal.masterCaptured;
    if (!opponentMaster) return config.evaluation.terminal.masterCaptured;

    // Temple arch reached - only if the game is actually over
    const [masterRow, masterCol] = playerMaster.position;
    const [oppMasterRow, oppMasterCol] = opponentMaster.position;

    // Check if player's master reached opponent's temple arch
    if (player === "red" && masterRow === 4 && masterCol === 2) return config.evaluation.terminal.templeArchReached;
    if (player === "blue" && masterRow === 0 && masterCol === 2) return config.evaluation.terminal.templeArchReached;

    // Check if opponent's master reached player's temple arch
    if (opponent === "red" && oppMasterRow === 4 && oppMasterCol === 2)
      return -config.evaluation.terminal.templeArchReached;
    if (opponent === "blue" && oppMasterRow === 0 && oppMasterCol === 2)
      return -config.evaluation.terminal.templeArchReached;

    // If we get here, it's a normal game position - calculate incremental score
    
    // Material count (more pieces = better)
    const playerPieces = this.getPieceCount(gameState.board, player);
    const opponentPieces = this.getPieceCount(gameState.board, opponent);
    score += (playerPieces - opponentPieces) * config.evaluation.material.pieceValue;

    // Master position value (progress toward opponent temple)
    const masterProgress = this.getMasterPositionValue(playerMaster, player, config);
    const oppMasterProgress = this.getMasterPositionValue(opponentMaster, opponent, config);
    score += masterProgress - oppMasterProgress;

    // Center control
    score += this.getCenterControl(gameState.board, player, config) * config.evaluation.positional.centerControl;
    score -= this.getCenterControl(gameState.board, opponent, config) * config.evaluation.positional.centerControl;

    // Master safety (being threatened is bad)
    const masterSafety = this.evaluateMasterSafety(gameState, player, config);
    const oppMasterSafety = this.evaluateMasterSafety(gameState, opponent, config);
    score += masterSafety - oppMasterSafety;

    // Add tactical bonuses for strong positions
    score += this.evaluateTacticalPosition(gameState, player, config);
    score -= this.evaluateTacticalPosition(gameState, opponent, config);

    // Add some controlled randomness to avoid repetitive play
    score += (Math.random() - 0.5) * config.algorithm.randomness.positionRandomness;

    // Clamp the score to reasonable bounds for non-terminal positions
    score = Math.max(config.algorithm.randomness.scoreBounds.min, 
                    Math.min(config.algorithm.randomness.scoreBounds.max, score));

    return score;
  }

    /**
   * Evaluate tactical aspects of the position
   */
  protected evaluateTacticalPosition(gameState: GameState, player: Player, config: AITacticalConfig): number {
    let tacticalScore = 0;
    
    // Count pieces that can capture opponent pieces next turn
    const moves = this.generateLegalMoves(gameState, player);
    const captureMoves = moves.filter(move => move.isCapture);
    tacticalScore += captureMoves.length * config.evaluation.tactical.captureOpportunity;
    
    // Bonus for having multiple move options (flexibility)
    tacticalScore += Math.min(moves.length * config.evaluation.tactical.flexibility, 
                             config.evaluation.tactical.maxFlexibility);
    
    return tacticalScore;
  }

  /**
   * Evaluate master position value
   */
  protected getMasterPositionValue(master: Piece, player: Player, config: AITacticalConfig): number {
    const [row, col] = master.position;
    let value = 0;

    // Progress toward opponent's temple arch
    if (player === "red") {
      value += (4 - row) * config.evaluation.positional.masterProgress; // Red moves down
      if (row >= 3) value += config.evaluation.positional.masterNearGoal; // Close to goal
    } else {
      value += row * config.evaluation.positional.masterProgress; // Blue moves up
      if (row <= 1) value += config.evaluation.positional.masterNearGoal; // Close to goal
    }

    // Center column bonus
    if (col === 2) value += config.evaluation.positional.masterCenterColumn;

    return value;
  }

  /**
   * Evaluate master safety
   */
  protected evaluateMasterSafety(gameState: GameState, player: Player, config: AITacticalConfig): number {
    const master = this.findMaster(gameState.board, player);
    if (!master) return -config.evaluation.tactical.masterThreatPenalty;

    let safety = 0;
    const [masterRow, masterCol] = master.position;
    const radius = config.evaluation.material.masterSafetyRadius;

    // Count friendly pieces nearby
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;

        const newRow = masterRow + dr;
        const newCol = masterCol + dc;

        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
          const piece = gameState.board[newRow][newCol];
          if (piece && piece.player === player && !piece.isMaster) {
            safety += config.evaluation.material.masterSafetyValue;
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
    player: Player,
    config: AITacticalConfig
  ): number {
    const centerPositions = config.evaluation.positional.centerPositions;

    let score = 0;
    for (const [row, col] of centerPositions) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        score += piece.isMaster ? config.evaluation.positional.masterCenterMultiplier : 1;
      }
    }
    return score;
  }
}
