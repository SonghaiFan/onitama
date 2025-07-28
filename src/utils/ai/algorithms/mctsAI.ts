import { GameState, Player, Piece } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata, getAllPlayerMoves } from "@/utils/gameManager";

interface MCTSNode {
  gameState: GameState;
  parent: MCTSNode | null;
  children: MCTSNode[];
  move: MoveWithMetadata | null;
  player: Player;
  visits: number;
  wins: number;
  untriedMoves: MoveWithMetadata[];
  isTerminal: boolean;
}

export class MCTSAI extends BaseAI {
  private explorationConstant: number;
  private maxIterations: number;

  constructor(
    maxDepth: number = 4,
    maxTime: number = 5000,
    explorationConstant: number = 1.414,
    maxIterations: number = 1000
  ) {
    super(maxDepth, maxTime);
    this.explorationConstant = explorationConstant;
    this.maxIterations = maxIterations;
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    const startTime = Date.now();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Create root node
    const rootNode = this.createNode(gameState, null, null, player);
    rootNode.untriedMoves = moves;

    // Run MCTS iterations
    const endTime = startTime + this.maxTime;
    let iterations = 0;

    while (Date.now() < endTime && iterations < this.maxIterations) {
      const node = this.select(rootNode);
      const expandedNode = this.expand(node);
      const result = this.simulate(expandedNode);
      this.backpropagate(expandedNode, result, player);
      iterations++;
    }

    // Find best move based on visit count
    const bestChild = this.getBestChild(rootNode, 0); // Pure exploitation
    const bestMove = bestChild.move || moves[0];

    const thinkingTime = Date.now() - startTime;

    return {
      move: bestMove,
      score: this.evaluateState(gameState, player),
      depth: this.maxDepth,
      nodesEvaluated: iterations,
      thinkingTime,
    };
  }

  private createNode(
    gameState: GameState,
    parent: MCTSNode | null,
    move: MoveWithMetadata | null,
    player: Player
  ): MCTSNode {
    const moves = this.generateLegalMoves(gameState, player);
    const isTerminal = this.isGameOver(gameState) || moves.length === 0;

    return {
      gameState: this.deepCopyGameState(gameState),
      parent,
      children: [],
      move,
      player,
      visits: 0,
      wins: 0,
      untriedMoves: moves,
      isTerminal,
    };
  }

  private select(node: MCTSNode): MCTSNode {
    while (!node.isTerminal && node.untriedMoves.length === 0) {
      if (node.children.length === 0) {
        return node;
      }
      node = this.getBestChild(node, this.explorationConstant);
    }
    return node;
  }

  private expand(node: MCTSNode): MCTSNode {
    if (node.untriedMoves.length === 0) {
      return node;
    }

    const move = node.untriedMoves.pop()!;
    const newGameState = this.simulateMove(node.gameState, move);
    const nextPlayer = node.player === "red" ? "blue" : "red";

    const childNode = this.createNode(newGameState, node, move, nextPlayer);
    node.children.push(childNode);

    return childNode;
  }

  private simulate(node: MCTSNode): Player | null {
    let currentState = this.deepCopyGameState(node.gameState);
    let currentPlayer = node.player;
    let depth = 0;

    while (!this.isGameOver(currentState) && depth < this.maxDepth) {
      const moves = this.generateLegalMoves(currentState, currentPlayer);

      if (moves.length === 0) {
        break;
      }

      // Random move selection for simulation
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      currentState = this.simulateMove(currentState, randomMove);
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
      depth++;
    }

    // Determine winner
    if (this.isGameOver(currentState)) {
      const redMaster = this.findMaster(currentState.board, "red");
      const blueMaster = this.findMaster(currentState.board, "blue");

      if (!redMaster) return "blue";
      if (!blueMaster) return "red";

      // Check temple arch victories
      if (redMaster.position[0] === 4 && redMaster.position[1] === 2)
        return "red";
      if (blueMaster.position[0] === 0 && blueMaster.position[1] === 2)
        return "blue";
    }

    return null; // Draw or no clear winner
  }

  private backpropagate(
    node: MCTSNode,
    result: Player | null,
    originalPlayer: Player
  ): void {
    while (node !== null) {
      node.visits++;

      if (result === originalPlayer) {
        node.wins++;
      } else if (result === null) {
        // Draw - add half a win
        node.wins += 0.5;
      }

      node = node.parent!;
    }
  }

  private getBestChild(node: MCTSNode, explorationConstant: number): MCTSNode {
    if (node.children.length === 0) {
      throw new Error("No children available for selection");
    }

    let bestChild = node.children[0];
    let bestScore = -Infinity;

    for (const child of node.children) {
      const exploitation = child.wins / child.visits;
      const exploration =
        explorationConstant * Math.sqrt(Math.log(node.visits) / child.visits);
      const score = exploitation + exploration;

      if (score > bestScore) {
        bestScore = score;
        bestChild = child;
      }
    }

    return bestChild;
  }

  // Enhanced evaluation function for MCTS
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

    // Material count with higher weight for MCTS
    const playerPieces = this.getPieceCount(gameState.board, player);
    const opponentPieces = this.getPieceCount(gameState.board, opponent);
    score += (playerPieces - opponentPieces) * 150;

    // Master position value
    score += this.getMasterPositionValue(playerMaster, player);
    score -= this.getMasterPositionValue(opponentMaster, opponent);

    // Center control
    score += this.getCenterControl(gameState.board, player) * 30;
    score -= this.getCenterControl(gameState.board, opponent) * 30;

    // Master safety
    score += this.evaluateMasterSafety(gameState, player);
    score -= this.evaluateMasterSafety(gameState, opponent);

    // Card advantage (unique to Onitama)
    score += this.evaluateCardAdvantage(gameState, player);

    return score;
  }

  private evaluateCardAdvantage(gameState: GameState, player: Player): number {
    let score = 0;
    const playerCards = gameState.players[player].cards;
    const sharedCard = gameState.sharedCard;

    // Evaluate card quality
    for (const card of playerCards) {
      score += this.evaluateCardQuality(card, player);
    }

    // Shared card evaluation
    if (sharedCard) {
      score += this.evaluateCardQuality(sharedCard, player) * 0.5;
    }

    return score;
  }

  private evaluateCardQuality(card: any, player: Player): number {
    // Simple card evaluation based on move count and patterns
    let score = card.moves.length * 10;

    // Bonus for cards with good movement patterns
    const hasForwardMoves = card.moves.some(
      (move: any) =>
        (player === "red" && move.y < 0) || (player === "blue" && move.y > 0)
    );
    if (hasForwardMoves) score += 20;

    // Bonus for wind spirit cards
    if (card.isWindCard) score += 30;

    return score;
  }
}
