import { GameState, Player, Piece } from "@/types/game";
import {
  MoveWithMetadata,
  getAllPlayerMoves,
  checkWinConditions,
  isTempleArch,
  getPossibleMoves,
} from "@/utils/gameManager";
import { eventBus, AIThinkingUpdateEvent } from "@/utils/eventBus";

export interface AIMoveResult {
  move: MoveWithMetadata;
  score: number;
  depth: number;
  nodesEvaluated: number;
  thinkingTime: number;
}

export type TTFlag = "EXACT" | "LOWERBOUND" | "UPPERBOUND";

export interface TTEntry {
  depth: number;
  score: number;
  flag: TTFlag;
  bestMove?: MoveWithMetadata;
}

/**
 * Base class for Onitama AI algorithms
 * Features high-performance state simulation, multi-factor positional evaluation,
 * Transposition Table, Move Ordering, Quiescence Search, and Iterative Deepening.
 */
export abstract class BaseAI {
  protected maxDepth: number;
  protected maxTime: number; // milliseconds
  protected startTime: number = 0;
  protected nodesCount: number = 0;
  protected stopSearch: boolean = false;

  // Transposition Table & Killer Moves
  protected transpositionTable: Map<string, TTEntry> = new Map();
  protected killerMoves: Map<number, MoveWithMetadata[]> = new Map();

  constructor(maxDepth: number = 4, maxTime: number = 3000) {
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
    const moves = getAllPlayerMoves(gameState, player);

    // Sort moves by priority: captures first, then regular moves
    // This matches the Rust implementation's move ordering logic
    moves.sort((a, b) => {
      // Captures get priority 0, regular moves get priority 1
      const priorityA = a.isCapture ? 0 : 1;
      const priorityB = b.isCapture ? 0 : 1;
      return priorityA - priorityB;
    });

    return moves;
  }

  /**
   * High-performance state simulation without JSON serialization
   * Accurately updates piece.position, exchanges cards, and detects O(1) terminal wins.
   */
  public simulateMove(
    gameState: GameState,
    move: MoveWithMetadata
  ): GameState {
    const fromRow = move.from[0];
    const fromCol = move.from[1];
    const toRow = move.to[0];
    const toCol = move.to[1];

    const fromPiece = gameState.board[fromRow][fromCol];
    if (!fromPiece) {
      return gameState;
    }

    // Fast shallow copy of 5 rows
    const newBoard: (Piece | null)[][] = [
      [...gameState.board[0]],
      [...gameState.board[1]],
      [...gameState.board[2]],
      [...gameState.board[3]],
      [...gameState.board[4]],
    ];

    const targetPiece = newBoard[toRow][toCol];

    // Moved piece with updated position (fixes critical position synchronization bug)
    const movedPiece: Piece = {
      ...fromPiece,
      position: [toRow, toCol],
    };

    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = movedPiece;

    // Exchange cards
    const currentPlayer = gameState.currentPlayer;
    const playerState = gameState.players[currentPlayer];
    const usedCard = playerState.cards[move.cardIndex];
    const sharedCard = gameState.sharedCard;
    const nextPlayer: Player = currentPlayer === "red" ? "blue" : "red";

    const newRedCards =
      currentPlayer === "red"
        ? [
            move.cardIndex === 0 ? sharedCard : playerState.cards[0],
            move.cardIndex === 1 ? sharedCard : playerState.cards[1],
          ]
        : gameState.players.red.cards;

    const newBlueCards =
      currentPlayer === "blue"
        ? [
            move.cardIndex === 0 ? sharedCard : playerState.cards[0],
            move.cardIndex === 1 ? sharedCard : playerState.cards[1],
          ]
        : gameState.players.blue.cards;

    let winner: Player | null = gameState.winner;
    let gamePhase = gameState.gamePhase;

    // O(1) terminal win check
    if (targetPiece?.isMaster) {
      winner = currentPlayer;
      gamePhase = "finished";
    } else if (
      movedPiece.isMaster &&
      isTempleArch(toRow, toCol, currentPlayer)
    ) {
      winner = currentPlayer;
      gamePhase = "finished";
    }

    return {
      board: newBoard,
      players: {
        red: { cards: newRedCards },
        blue: { cards: newBlueCards },
      },
      sharedCard: usedCard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      selectedCard: null,
      windSpiritPosition: gameState.windSpiritPosition,
      winner,
      gamePhase,
      cardPacks: gameState.cardPacks,
    };
  }

  /**
   * Check if the game is finished
   */
  protected isGameOver(gameState: GameState): boolean {
    if (gameState.winner) return true;
    return checkWinConditions(gameState) !== null;
  }

  /**
   * Generate a fast, compact hash string for Transposition Table
   */
  protected getStateKey(gameState: GameState): string {
    let boardKey = "";
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const p = gameState.board[r][c];
        if (!p) {
          boardKey += ".";
        } else if (p.player === "red") {
          boardKey += p.isMaster ? "M" : "s";
        } else if (p.player === "blue") {
          boardKey += p.isMaster ? "W" : "b";
        } else {
          boardKey += "N";
        }
      }
    }

    const redCards = gameState.players.red.cards.map((c) => c.name).sort().join(",");
    const blueCards = gameState.players.blue.cards.map((c) => c.name).sort().join(",");
    const shared = gameState.sharedCard ? gameState.sharedCard.name : "";

    return `${boardKey}|${redCards}|${blueCards}|${shared}|${gameState.currentPlayer}`;
  }

  // ============================================================================
  // MULTI-FACTOR POSITIONAL EVALUATION FUNCTION
  // ============================================================================

  /**
   * Comprehensive positional board evaluation.
   * Returns score from perspective of `perspectivePlayer` (positive = good for perspectivePlayer).
   */
  public evaluateBoard(
    gameState: GameState,
    perspectivePlayer: Player = "red",
    ply: number = 0
  ): number {
    // 1. Terminal win/loss check with mate-distance penalty
    let winner = gameState.winner;
    if (!winner) {
      winner = checkWinConditions(gameState);
    }

    if (winner) {
      const isPerspectiveWinner = winner === perspectivePlayer;
      return isPerspectiveWinner
        ? 1000000 - ply * 1000
        : -1000000 + ply * 1000;
    }

    // 2. Single-pass board inspection
    let redStudents = 0;
    let blueStudents = 0;
    let redMasterPos: [number, number] | null = null;
    let blueMasterPos: [number, number] | null = null;
    let redCenterControl = 0;
    let blueCenterControl = 0;
    let redArchDefended = false;
    let blueArchDefended = false;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const piece = gameState.board[r][c];
        if (!piece || piece.isWindSpirit) continue;

        const isRed = piece.player === "red";
        if (piece.isMaster) {
          if (isRed) redMasterPos = [r, c];
          else blueMasterPos = [r, c];
        } else {
          if (isRed) {
            redStudents++;
            if (r === 4 && c === 2) redArchDefended = true; // Red student on red arch
          } else {
            blueStudents++;
            if (r === 0 && c === 2) blueArchDefended = true; // Blue student on blue arch
          }
        }

        // Center control: [2, 2] is the central pivot; [1..3, 1..3] inner ring
        if (r === 2 && c === 2) {
          if (isRed) redCenterControl += 30;
          else blueCenterControl += 30;
        } else if (r >= 1 && r <= 3 && c >= 1 && c <= 3) {
          if (isRed) redCenterControl += 10;
          else blueCenterControl += 10;
        }
      }
    }

    // Material score (students value)
    let score = (redStudents - blueStudents) * 130;

    // Center board control
    score += redCenterControl - blueCenterControl;

    // 3. Way of the Stream: Master distance to opponent's Temple Arch
    // Red goal: [0, 2]; Blue goal: [4, 2]
    if (redMasterPos) {
      const distToGoal = redMasterPos[0] + Math.abs(redMasterPos[1] - 2);
      if (distToGoal === 1) score += 350; // Imminent threat!
      else if (distToGoal === 2) score += 120;
      else if (distToGoal === 3) score += 40;
    }

    if (blueMasterPos) {
      const distToGoal = (4 - blueMasterPos[0]) + Math.abs(blueMasterPos[1] - 2);
      if (distToGoal === 1) score -= 350; // Imminent threat!
      else if (distToGoal === 2) score -= 120;
      else if (distToGoal === 3) score -= 40;
    }

    // 4. Temple Arch Defense bonus
    if (redArchDefended) score += 60;
    if (blueArchDefended) score -= 60;

    // 5. Tactical Threat / In-Check Alert
    // Check if the current player's Master is directly attacked by opponent's current cards
    if (redMasterPos && this.isPositionAttacked(gameState, redMasterPos, "blue")) {
      score -= 220;
    }
    if (blueMasterPos && this.isPositionAttacked(gameState, blueMasterPos, "red")) {
      score += 220;
    }

    return perspectivePlayer === "red" ? score : -score;
  }

  /**
   * Helper to check if a specific position is under attack by a player using their current cards
   */
  protected isPositionAttacked(
    gameState: GameState,
    targetPos: [number, number],
    byPlayer: Player
  ): boolean {
    const cards = gameState.players[byPlayer].cards;

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const piece = gameState.board[r][c];
        if (!piece || piece.player !== byPlayer) continue;

        for (const card of cards) {
          const moves = getPossibleMoves(piece, card, gameState.board, byPlayer);
          for (const [tr, tc] of moves) {
            if (tr === targetPos[0] && tc === targetPos[1]) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Basic evaluation compatible with existing code (Red-maximizing)
   */
  protected basicValue(gameState: GameState): number {
    return this.evaluateBoard(gameState, "red", 0);
  }

  // ============================================================================
  // MOVE ORDERING & QUIESCENCE SEARCH
  // ============================================================================

  /**
   * Score a move for move ordering (higher score evaluated first)
   */
  protected scoreMove(
    move: MoveWithMetadata,
    gameState: GameState,
    player: Player,
    ttMove?: MoveWithMetadata,
    ply: number = 0
  ): number {
    // 1. Transposition Table move gets absolute top priority
    if (
      ttMove &&
      move.from[0] === ttMove.from[0] &&
      move.from[1] === ttMove.from[1] &&
      move.to[0] === ttMove.to[0] &&
      move.to[1] === ttMove.to[1] &&
      move.cardIndex === ttMove.cardIndex
    ) {
      return 100000;
    }

    const targetPiece = gameState.board[move.to[0]][move.to[1]];

    // 2. Winning moves: Master capture (Way of the Stone) or Temple Arch entry (Way of the Stream)
    if (targetPiece?.isMaster) {
      return 80000;
    }
    if (move.piece.isMaster && isTempleArch(move.to[0], move.to[1], player)) {
      return 75000;
    }

    // 3. Captures: MVV-LVA
    if (targetPiece) {
      return 10000;
    }

    // 4. Master moving towards opponent temple arch
    if (move.piece.isMaster && move.distanceToGoal !== undefined) {
      return (4 - move.distanceToGoal) * 800;
    }

    // 5. Killer moves at this ply
    const killers = this.killerMoves.get(ply);
    if (killers) {
      for (const k of killers) {
        if (
          move.from[0] === k.from[0] &&
          move.from[1] === k.from[1] &&
          move.to[0] === k.to[0] &&
          move.to[1] === k.to[1]
        ) {
          return 5000;
        }
      }
    }

    // 6. Central territory control
    if (move.to[0] === 2 && move.to[1] === 2) {
      return 200;
    }

    return 0;
  }

  /**
   * Order moves using heuristic scores
   */
  protected orderMoves(
    moves: MoveWithMetadata[],
    gameState: GameState,
    player: Player,
    ttMove?: MoveWithMetadata,
    ply: number = 0
  ): MoveWithMetadata[] {
    return [...moves].sort((a, b) => {
      const scoreA = this.scoreMove(a, gameState, player, ttMove, ply);
      const scoreB = this.scoreMove(b, gameState, player, ttMove, ply);
      return scoreB - scoreA;
    });
  }

  /**
   * Quiescence search: resolves tactical capture sequences to eliminate the Horizon Effect
   */
  protected quiescenceSearch(
    gameState: GameState,
    player: Player,
    alpha: number,
    beta: number,
    ply: number,
    maxQDepth: number = 2
  ): number {
    this.nodesCount++;

    const standPat = this.evaluateBoard(gameState, player, ply);
    if (ply >= 20 || maxQDepth <= 0 || this.isTimeUp() || this.stopSearch) {
      return standPat;
    }

    if (standPat >= beta) {
      return beta;
    }
    if (standPat > alpha) {
      alpha = standPat;
    }

    // Only consider capture moves and immediate wins in quiescence
    const legalMoves = this.generateLegalMoves(gameState, player);
    const noisyMoves = legalMoves.filter(
      (m) =>
        m.isCapture ||
        (m.piece.isMaster && isTempleArch(m.to[0], m.to[1], player))
    );

    const orderedMoves = this.orderMoves(noisyMoves, gameState, player, undefined, ply);

    for (const move of orderedMoves) {
      if (this.isTimeUp() || this.stopSearch) break;

      const nextState = this.simulateMove(gameState, move);
      const nextPlayer: Player = player === "red" ? "blue" : "red";
      const score = -this.quiescenceSearch(
        nextState,
        nextPlayer,
        -beta,
        -alpha,
        ply + 1,
        maxQDepth - 1
      );

      if (score >= beta) {
        return beta;
      }
      if (score > alpha) {
        alpha = score;
      }
    }

    return alpha;
  }

  // ============================================================================
  // NEGAMAX WITH ALPHA-BETA PRUNING & TRANSPOSITION TABLE
  // ============================================================================

  /**
   * Principal Variation Negamax Search with Alpha-Beta pruning
   */
  protected negamax(
    gameState: GameState,
    player: Player,
    depth: number,
    alpha: number,
    beta: number,
    ply: number
  ): { score: number; bestMove?: MoveWithMetadata } {
    this.nodesCount++;

    if (this.isTimeUp()) {
      this.stopSearch = true;
      return { score: this.evaluateBoard(gameState, player, ply) };
    }

    // Terminal state check
    if (this.isGameOver(gameState)) {
      return { score: this.evaluateBoard(gameState, player, ply) };
    }

    // Leaf node: enter quiescence search
    if (depth <= 0) {
      const qScore = this.quiescenceSearch(gameState, player, alpha, beta, ply);
      return { score: qScore };
    }

    const stateKey = this.getStateKey(gameState);
    const ttEntry = this.transpositionTable.get(stateKey);

    // Transposition table cutoff (only if not at root)
    if (ttEntry && ttEntry.depth >= depth && ply > 0) {
      if (ttEntry.flag === "EXACT") {
        return { score: ttEntry.score, bestMove: ttEntry.bestMove };
      } else if (ttEntry.flag === "LOWERBOUND") {
        alpha = Math.max(alpha, ttEntry.score);
      } else if (ttEntry.flag === "UPPERBOUND") {
        beta = Math.min(beta, ttEntry.score);
      }
      if (alpha >= beta) {
        return { score: ttEntry.score, bestMove: ttEntry.bestMove };
      }
    }

    const legalMoves = this.generateLegalMoves(gameState, player);
    if (legalMoves.length === 0) {
      // Stalemate / No moves (treated as terminal)
      return { score: this.evaluateBoard(gameState, player, ply) };
    }

    const orderedMoves = this.orderMoves(
      legalMoves,
      gameState,
      player,
      ttEntry?.bestMove,
      ply
    );

    let bestScore = -Infinity;
    let bestMove = orderedMoves[0];
    const initialAlpha = alpha;

    for (const move of orderedMoves) {
      if (this.isTimeUp() || this.stopSearch) break;

      const nextState = this.simulateMove(gameState, move);
      const nextPlayer: Player = player === "red" ? "blue" : "red";

      const result = this.negamax(
        nextState,
        nextPlayer,
        depth - 1,
        -beta,
        -alpha,
        ply + 1
      );

      const score = -result.score;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);

      if (alpha >= beta) {
        // Beta cutoff - record killer move
        if (!move.isCapture) {
          const killers = this.killerMoves.get(ply) || [];
          if (!killers.some((k) => k.from[0] === move.from[0] && k.to[0] === move.to[0])) {
            this.killerMoves.set(ply, [move, ...killers.slice(0, 1)]);
          }
        }
        break;
      }
    }

    // Store evaluation in Transposition Table
    if (!this.stopSearch) {
      let flag: TTFlag = "EXACT";
      if (bestScore <= initialAlpha) flag = "UPPERBOUND";
      else if (bestScore >= beta) flag = "LOWERBOUND";

      if (this.transpositionTable.size < 80000) {
        this.transpositionTable.set(stateKey, {
          depth,
          score: bestScore,
          flag,
          bestMove,
        });
      }
    }

    return { score: bestScore, bestMove };
  }

  /**
   * Search with Iterative Deepening (IDDFS) & Safe Time Management
   */
  public async searchWithIterativeDeepening(
    gameState: GameState,
    player: Player,
    targetDepth: number = this.maxDepth,
    timeBudgetMs: number = this.maxTime
  ): Promise<AIMoveResult> {
    this.maxTime = timeBudgetMs;
    this.startTime = Date.now();
    this.nodesCount = 0;
    this.stopSearch = false;
    this.transpositionTable.clear();
    this.killerMoves.clear();

    const legalMoves = this.generateLegalMoves(gameState, player);
    if (legalMoves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    if (legalMoves.length === 1) {
      return {
        move: legalMoves[0],
        score: 0,
        depth: 1,
        nodesEvaluated: 1,
        thinkingTime: Date.now() - this.startTime,
      };
    }

    let overallBestMove = legalMoves[0];
    let overallBestScore = 0;
    let completedDepth = 1;

    for (let depth = 1; depth <= targetDepth; depth++) {
      if (this.isTimeUp()) break;

      const result = this.negamax(
        gameState,
        player,
        depth,
        -Infinity,
        Infinity,
        0
      );

      // Only accept results from depth iterations that finished without timeout
      if (!this.stopSearch && result.bestMove) {
        overallBestMove = result.bestMove;
        overallBestScore = result.score;
        completedDepth = depth;

        this.emitThinkingUpdate({
          score: result.score,
          depth,
          nodesEvaluated: this.nodesCount,
          bestMoveFound: result.bestMove,
        });

        // Early exit if forced mate is found
        if (Math.abs(result.score) >= 900000) {
          break;
        }
      } else {
        // Aborted due to timeout, retain the previous completed depth's best move
        break;
      }
    }

    return {
      move: overallBestMove,
      score: overallBestScore,
      depth: completedDepth,
      nodesEvaluated: this.nodesCount,
      thinkingTime: Date.now() - this.startTime,
    };
  }

  // ============================================================================
  // LEGACY ALGORITHM BUILDING BLOCKS (Maintained for Compatibility)
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

  /**
   * Classic minimax implementation
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

    const bestScore = isMaximizing ? Math.max(...scores) : Math.min(...scores);

    return { score: bestScore, nodesEvaluated };
  }

  /**
   * Alpha-beta implementation
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
   * Run random simulation (for Monte Carlo algorithms)
   */
  protected runRandomSimulation(
    gameState: GameState,
    maxMoves: number = 200
  ): Player | null {
    let currentState = gameState;
    let moves = 0;

    while (moves < maxMoves) {
      if (currentState.winner) return currentState.winner;
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
        if (Math.abs(result.score) >= 900000) break;
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
