import { GameState, Player, CardPack } from "@/types/game";
import {
  executeMove,
  getAllPossibleMoves,
  validateWindSpiritMove,
} from "./gameManager";
import { AIService } from "./aiService";
import { AIAlgorithm } from "./ai/aiFactory";
import { createNewGameAsync } from "./dataLoader";

export interface GameControllerConfig {
  aiAlgorithm: AIAlgorithm;
  aiThinkingTime: number;
}

export interface GameAction {
  type:
    | "PIECE_SELECT"
    | "CARD_SELECT"
    | "MOVE_EXECUTE"
    | "AI_MOVE"
    | "GAME_RESET"
    | "AI_CONFIG_CHANGE"
    | "AI_PLAYER_SET";
  payload: unknown;
}

export interface GameControllerState {
  gameState: GameState;
  isLoading: boolean;
  aiService: AIService;
  config: GameControllerConfig;
  isAITurn: boolean;
  aiPlayer: Player | null;
}

/**
 * Centralized Game Controller for Onitama
 * Manages all game state, AI logic, and provides a clean API
 */
export class GameController {
  private state: GameControllerState;
  private listeners: Set<(state: GameControllerState) => void> = new Set();
  private aiService: AIService;

  constructor(config: Partial<GameControllerConfig> = {}) {
    this.aiService = new AIService(
      config.aiAlgorithm || "montecarlo",
      config.aiThinkingTime || 1000
    );

    this.state = {
      gameState: {} as GameState, // Will be initialized in init()
      isLoading: true,
      aiService: this.aiService,
      config: {
        aiAlgorithm: config.aiAlgorithm || "montecarlo",
        aiThinkingTime: config.aiThinkingTime || 1000,
      },
      isAITurn: false,
      aiPlayer: null,
    };
  }

  /**
   * Initialize the game controller
   */
  async init(cardPacks: CardPack[] = ["normal"]): Promise<void> {
    this.setState({ isLoading: true });

    try {
      const gameState = await createNewGameAsync(cardPacks);
      this.setState({
        gameState,
        isLoading: false,
      });

      // Check if AI should make the first move
      setTimeout(() => {
        if (
          this.state.aiPlayer &&
          this.state.gameState.currentPlayer === this.state.aiPlayer
        ) {
          this.checkAITurn();
        }
      }, 200);
    } catch (error) {
      console.error("Failed to initialize game:", error);
      this.setState({ isLoading: false });
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: GameControllerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current state
   */
  getState(): GameControllerState {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<GameControllerState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Handle piece selection
   */
  selectPiece(position: [number, number]): void {
    const { gameState } = this.state;
    if (gameState.winner || gameState.gamePhase !== "playing") return;

    const [row, col] = position;
    const piece = gameState.board[row][col];

    // Handle move to empty square or capture
    if (!piece && gameState.selectedPiece && gameState.selectedCard !== null) {
      const possibleMoves = getAllPossibleMoves(
        gameState,
        gameState.selectedPiece,
        gameState.selectedCard
      );

      if (possibleMoves.some(([r, c]) => r === row && c === col)) {
        this.executeMove(
          gameState.selectedPiece,
          position,
          gameState.selectedCard
        );
      }
      return;
    }

    // Handle piece selection or capture
    if (piece) {
      // In dual move mode, only allow wind spirit selection
      if (gameState.isDualMoveInProgress) {
        if (piece.isWindSpirit) {
          this.setState({
            gameState: { ...gameState, selectedPiece: position },
          });
        }
        return;
      }

      // Select own piece or wind spirit
      if (piece.player === gameState.currentPlayer || piece.isWindSpirit) {
        // Additional validation for wind spirit moves
        if (piece.isWindSpirit && gameState.selectedCard !== null) {
          const card =
            gameState.players[gameState.currentPlayer].cards[
              gameState.selectedCard
            ];
          if (!validateWindSpiritMove(gameState, piece, card)) {
            return;
          }
        }

        this.setState({
          gameState: { ...gameState, selectedPiece: position },
        });
      } else if (gameState.selectedPiece && gameState.selectedCard !== null) {
        // Capture opponent's piece
        const possibleMoves = getAllPossibleMoves(
          gameState,
          gameState.selectedPiece,
          gameState.selectedCard
        );

        if (possibleMoves.some(([r, c]) => r === row && c === col)) {
          this.executeMove(
            gameState.selectedPiece,
            position,
            gameState.selectedCard
          );
        }
      }
    } else {
      // Clear selection when clicking empty square
      this.setState({
        gameState: {
          ...gameState,
          selectedPiece: null,
          selectedCard: null,
        },
      });
    }
  }

  /**
   * Handle card selection
   */
  selectCard(cardIndex: number, player: Player): void {
    const { gameState } = this.state;
    if (gameState.winner || player !== gameState.currentPlayer) return;
    if (gameState.isDualMoveInProgress) return;

    this.setState({
      gameState: { ...gameState, selectedCard: cardIndex },
    });
  }

  /**
   * Execute a move (player move)
   */
  executeMove(
    from: [number, number],
    to: [number, number],
    cardIndex: number
  ): void {
    const { gameState } = this.state;
    if (gameState.winner) return;

    const newGameState = executeMove(gameState, from, to, cardIndex);
    this.setState({ gameState: newGameState });

    // Wait for player move animation to complete before starting AI turn
    // The motion animation uses spring with damping: 20, which typically takes ~500ms to settle
    // Use requestAnimationFrame to ensure this doesn't block the current animation frame
    requestAnimationFrame(() => {
      setTimeout(() => {
        this.checkAITurn();
      }, 600);
    });
  }

  /**
   * Set AI player
   */
  setAIPlayer(player: Player | null): void {
    this.setState({ aiPlayer: player });
    // Delay AI check to ensure state is fully updated
    setTimeout(() => this.checkAITurn(), 100);
  }

  /**
   * Update AI configuration
   */
  updateAIConfig(config: Partial<GameControllerConfig>): void {
    if (config.aiAlgorithm) {
      this.aiService.setAlgorithm(config.aiAlgorithm);
    }
    if (config.aiThinkingTime) {
      this.aiService.setThinkingTime(config.aiThinkingTime);
    }

    this.setState({
      config: { ...this.state.config, ...config },
    });
  }

  /**
   * Reset the game
   */
  async resetGame(cardPacks: CardPack[] = ["normal"]): Promise<void> {
    await this.init(cardPacks);
    // Delay AI check to ensure React state updates are complete
    setTimeout(() => {
      if (this.state.aiPlayer) {
        this.checkAITurn();
      }
    }, 200);
  }

  /**
   * Check if AI should make a move (non-blocking)
   */
  private checkAITurn(): void {
    const { gameState, aiPlayer, isAITurn } = this.state;

    if (
      aiPlayer &&
      gameState.currentPlayer === aiPlayer &&
      !gameState.winner &&
      !isAITurn &&
      gameState.gamePhase === "playing"
    ) {
      this.executeAIMove();
    }
  }

  /**
   * Execute AI move (fully asynchronous, non-blocking)
   */
  private executeAIMove(): void {
    const { gameState, aiPlayer } = this.state;
    if (!aiPlayer || gameState.winner || gameState.gamePhase !== "playing")
      return;

    // Set AI turn state immediately for UI feedback
    this.setState({ isAITurn: true });

    // Process AI move asynchronously without blocking
    this.aiService
      .getAIMove(gameState, aiPlayer)
      .then((aiMove) => {
        // Check if game state is still valid when AI move completes
        if (
          this.state.gameState.winner ||
          this.state.gameState.gamePhase !== "playing"
        ) {
          this.setState({ isAITurn: false });
          return;
        }

        // Execute the AI move
        const newGameState = executeMove(
          this.state.gameState,
          aiMove.from,
          aiMove.to,
          aiMove.cardIndex
        );
        this.setState({
          gameState: newGameState,
          isAITurn: false,
        });

        // Schedule next AI turn check after AI animation completes
        setTimeout(() => {
          this.checkAITurn();
        }, 600);
      })
      .catch((error) => {
        console.error("AI move failed:", error);
        this.setState({ isAITurn: false });
      });
  }

  /**
   * Get possible moves for current selection
   */
  getPossibleMoves(): [number, number][] {
    const { gameState } = this.state;
    if (!gameState.selectedPiece || gameState.selectedCard === null) return [];

    return getAllPossibleMoves(
      gameState,
      gameState.selectedPiece,
      gameState.selectedCard
    );
  }

  /**
   * Check if a move is valid
   */
  isValidMove(
    from: [number, number],
    to: [number, number],
    cardIndex: number
  ): boolean {
    const { gameState } = this.state;
    const possibleMoves = getAllPossibleMoves(gameState, from, cardIndex);
    return possibleMoves.some(([row, col]) => row === to[0] && col === to[1]);
  }
}

// Default game controller instance
export const defaultGameController = new GameController();
