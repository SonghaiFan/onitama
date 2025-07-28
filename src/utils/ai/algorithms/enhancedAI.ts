import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MCTSAI } from "./mctsAI";

export class EnhancedAI extends BaseAI {
  private mctsAI: MCTSAI;
  private useMCTS: boolean;

  constructor(
    maxDepth: number = 4,
    maxTime: number = 5000,
    useMCTS: boolean = true
  ) {
    super(maxDepth, maxTime);
    this.mctsAI = new MCTSAI(maxDepth, maxTime);
    this.useMCTS = useMCTS;
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    const startTime = Date.now();

    if (this.generateLegalMoves(gameState, player).length === 0) {
      throw new Error("No valid moves available for AI");
    }

    let result: AIMoveResult;

    // Choose algorithm based on game state complexity
    if (this.useMCTS && this.shouldUseMCTS(gameState)) {
      // Use MCTS for complex positions
      result = await this.mctsAI.findBestMove(gameState, player);
    } else {
      // Use minimax for simpler positions or when MCTS is disabled
      const minimaxResult = this.findBestMoveWithMinimax(
        gameState,
        player,
        this.maxDepth
      );

      result = {
        move: minimaxResult.move,
        score: minimaxResult.score,
        depth: this.maxDepth,
        nodesEvaluated: this.generateLegalMoves(gameState, player).length,
        thinkingTime: Date.now() - startTime,
      };
    }

    return result;
  }

  private shouldUseMCTS(gameState: GameState): boolean {
    // Use MCTS for complex positions
    const moveCount = this.generateLegalMoves(
      gameState,
      gameState.currentPlayer
    ).length;
    const pieceCount =
      this.getPieceCount(gameState.board, "red") +
      this.getPieceCount(gameState.board, "blue");

    // MCTS is better for:
    // 1. Many possible moves (high branching factor)
    // 2. Many pieces on board (complex position)
    // 3. Mid-game positions
    return moveCount > 8 || pieceCount > 6;
  }

  // Enhanced evaluation function combining both approaches
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
    score += (playerPieces - opponentPieces) * 120;

    // Master position value
    score += this.getMasterPositionValue(playerMaster, player);
    score -= this.getMasterPositionValue(opponentMaster, opponent);

    // Center control
    score += this.getCenterControl(gameState.board, player) * 25;
    score -= this.getCenterControl(gameState.board, opponent) * 25;

    // Master safety
    score += this.evaluateMasterSafety(gameState, player);
    score -= this.evaluateMasterSafety(gameState, opponent);

    // Card advantage (inspired by jackadamson's approach)
    score += this.evaluateCardAdvantage(gameState, player);

    // Mobility evaluation (number of legal moves)
    const playerMoves = this.generateLegalMoves(gameState, player).length;
    const opponentMoves = this.generateLegalMoves(gameState, opponent).length;
    score += (playerMoves - opponentMoves) * 5;

    return score;
  }

  private evaluateCardAdvantage(gameState: GameState, player: Player): number {
    let score = 0;
    const playerCards = gameState.players[player].cards;
    const sharedCard = gameState.sharedCard;

    // Evaluate card quality and synergy
    for (const card of playerCards) {
      score += this.evaluateCardQuality(card, player);
    }

    // Shared card evaluation
    if (sharedCard) {
      score += this.evaluateCardQuality(sharedCard, player) * 0.6;
    }

    return score;
  }

  private evaluateCardQuality(card: any, player: Player): number {
    let score = card.moves.length * 12;

    // Bonus for cards with good movement patterns
    const hasForwardMoves = card.moves.some(
      (move: any) =>
        (player === "red" && move.y < 0) || (player === "blue" && move.y > 0)
    );
    if (hasForwardMoves) score += 25;

    // Bonus for wind spirit cards
    if (card.isWindCard) score += 35;

    // Bonus for cards with diagonal moves
    const hasDiagonalMoves = card.moves.some(
      (move: any) => move.x !== 0 && move.y !== 0
    );
    if (hasDiagonalMoves) score += 15;

    return score;
  }
}
