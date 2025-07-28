import { GameState, Player, CardPack, AIPlayerConfig, AIDifficulty } from "@/types/game";
import {
  executeMove,
  getAllPossibleMoves,
  validateWindSpiritMove,
} from "./gameManager";
import { AIService } from "./aiService";
import { createNewGameAsync } from "./dataLoader";
import { AIFactory } from "./ai/aiFactory";
import { loadTacticalConfig } from "./ai/tacticalConfigLoader";

export interface GameControllerConfig {
  aiDifficulty: AIDifficulty;
  aiThinkingTime: number;
  aiRandomness: number;
  // New AI control config
  defaultAIAutoMode: boolean;
  defaultAIMoveDelay: number;
  maxAIMoveDelay: number;
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
  aiServices: {
    red: AIService | null;
    blue: AIService | null;
  };
  config: GameControllerConfig;
  isAITurn: boolean;
  aiPlayers: {
    red: AIPlayerConfig | null;
    blue: AIPlayerConfig | null;
  };
  // New AI control features
  isAIAutoMode: boolean;
  isAIvsAIRunning: boolean;
  aiMoveDelay: number;
}

/**
 * Centralized Game Controller for Onitama
 * Manages all game state, AI logic, and provides a clean API
 */
export class GameController {
  private state: GameControllerState;
  private listeners: Set<(state: GameControllerState) => void> = new Set();

  constructor(config: Partial<GameControllerConfig> = {}) {
    this.state = {
      gameState: {} as GameState, // Will be initialized in init()
      isLoading: true,
      aiServices: {
        red: null,
        blue: null,
      },
      config: {
        aiDifficulty: config.aiDifficulty || "medium",
        aiThinkingTime: config.aiThinkingTime || 1000,
        aiRandomness: config.aiRandomness || 0.2,
        // New AI control config
        defaultAIAutoMode: config.defaultAIAutoMode ?? true,
        defaultAIMoveDelay: config.defaultAIMoveDelay || 1500,
        maxAIMoveDelay: config.maxAIMoveDelay || 5000,
      },
      isAITurn: false,
      aiPlayers: {
        red: null,
        blue: null,
      },
      // New AI control features
      isAIAutoMode: config.defaultAIAutoMode ?? true,
      isAIvsAIRunning: false,
      aiMoveDelay: config.defaultAIMoveDelay || 1500,
    };
  }

  /**
   * Initialize the game controller
   */
  async init(cardPacks: CardPack[] = ["normal"]): Promise<void> {
    this.setState({ isLoading: true });

    try {
      const result = await createNewGameAsync(cardPacks);
      this.setState({
        gameState: result.gameState,
        isLoading: false,
      });

      // Check if AI should make the first move
      setTimeout(() => {
        this.checkAITurn();
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
   * Execute a move
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

    // Check if AI should make a move
    this.checkAITurn();
  }

  /**
   * Set AI player configuration
   */
  async setAIPlayer(player: Player, config: AIPlayerConfig | null): Promise<void> {
    const newAIPlayers = { ...this.state.aiPlayers };
    const newAIServices = { ...this.state.aiServices };
    
    if (config && config.isEnabled) {
      // Create AI service for this player
      const aiService = new AIService({
        difficulty: config.difficulty,
        thinkingTime: this.state.config.aiThinkingTime,
        randomness: this.state.config.aiRandomness,
      });
      
      // Load tactical configuration
      const tacticalConfig = await loadTacticalConfig(config.tacticalPreset);
      const ai = AIFactory.getAI(config.difficulty);
      ai.setTacticalConfig(tacticalConfig);
      
      newAIPlayers[player] = config;
      newAIServices[player] = aiService;
    } else {
      // Remove AI for this player
      newAIPlayers[player] = null;
      newAIServices[player] = null;
    }
    
    this.setState({ 
      aiPlayers: newAIPlayers,
      aiServices: newAIServices
    });
    
    // Delay AI check to ensure state is fully updated
    setTimeout(() => this.checkAITurn(), 100);
  }

  /**
   * Set both AI players for AI vs AI mode
   */
  async setAIvsAI(
    redConfig: AIPlayerConfig,
    blueConfig: AIPlayerConfig
  ): Promise<void> {
    await this.setAIPlayer("red", redConfig);
    await this.setAIPlayer("blue", blueConfig);
  }

  /**
   * Disable all AI players (human vs human)
   */
  async setHumanvsHuman(): Promise<void> {
    await this.setAIPlayer("red", null);
    await this.setAIPlayer("blue", null);
  }

  /**
   * Update AI configuration
   */
  updateAIConfig(config: Partial<GameControllerConfig>): void {
    // Update all AI services
    Object.values(this.state.aiServices).forEach(aiService => {
      if (aiService) {
        aiService.setConfig({
          difficulty: config.aiDifficulty || this.state.config.aiDifficulty,
          thinkingTime: config.aiThinkingTime || this.state.config.aiThinkingTime,
          randomness: config.aiRandomness || this.state.config.aiRandomness,
        });
      }
    });

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
      this.checkAITurn();
    }, 200);
  }

  /**
   * Check if AI should make a move
   */
  private async checkAITurn(): Promise<void> {
    const { gameState, aiPlayers, isAITurn, isAIAutoMode } = this.state;
    const currentPlayerAI = aiPlayers[gameState.currentPlayer];

    if (
      currentPlayerAI &&
      currentPlayerAI.isEnabled &&
      !gameState.winner &&
      !isAITurn &&
      gameState.gamePhase === "playing" &&
      isAIAutoMode // Only auto-execute if in auto mode
    ) {
      await this.executeAIMove();
    }
  }

  /**
   * Execute AI move
   */
  private async executeAIMove(): Promise<void> {
    const { gameState, aiPlayers, aiServices } = this.state;
    const currentPlayer = gameState.currentPlayer;
    const currentPlayerAI = aiPlayers[currentPlayer];
    const aiService = aiServices[currentPlayer];
    
    if (!currentPlayerAI || !aiService || gameState.winner || gameState.gamePhase !== "playing")
      return;

    this.setState({ isAITurn: true });

    try {
      // Use the AI with tactical configuration
      const ai = AIFactory.getAI(currentPlayerAI.difficulty);
      await ai.initialize(currentPlayerAI.tacticalPreset);
      
      const aiMove = await ai.findBestMove(gameState, currentPlayer);
      this.executeMove(aiMove.move.from, aiMove.move.to, aiMove.move.cardIndex);
    } catch (error) {
      console.error("AI move failed:", error);
    } finally {
      this.setState({ isAITurn: false });
    }
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

  /**
   * New AI Control Methods
   */

  /**
   * Toggle AI auto mode (automatic vs manual execution)
   */
  setAIAutoMode(enabled: boolean): void {
    this.setState({ isAIAutoMode: enabled });
    // If enabling auto mode and it's AI's turn, immediately check for move
    if (enabled) {
      setTimeout(() => this.checkAITurn(), 100);
    }
  }

  /**
   * Set AI move delay for AI vs AI games
   */
  setAIMoveDelay(delay: number): void {
    const { config } = this.state;
    const clampedDelay = Math.min(Math.max(delay, 100), config.maxAIMoveDelay);
    this.setState({ aiMoveDelay: clampedDelay });
  }

  /**
   * Manually trigger AI move (when in manual mode)
   */
  async triggerAIMove(): Promise<void> {
    const { gameState, aiPlayers, isAITurn } = this.state;
    const currentPlayerAI = aiPlayers[gameState.currentPlayer];

    if (
      currentPlayerAI &&
      currentPlayerAI.isEnabled &&
      !gameState.winner &&
      !isAITurn &&
      gameState.gamePhase === "playing"
    ) {
      await this.executeAIMove();
    }
  }

  /**
   * Start continuous AI vs AI gameplay
   */
  async startAIvsAI(): Promise<void> {
    const { aiPlayers } = this.state;
    
    if (!aiPlayers.red?.isEnabled || !aiPlayers.blue?.isEnabled) {
      console.warn("Both players must have AI enabled for AI vs AI mode");
      return;
    }

    this.setState({ 
      isAIvsAIRunning: true,
      isAIAutoMode: true 
    });
    
    // Start the AI vs AI loop
    this.runAIvsAILoop();
  }

  /**
   * Stop continuous AI vs AI gameplay
   */
  stopAIvsAI(): void {
    this.setState({ isAIvsAIRunning: false });
  }

  /**
   * Main AI vs AI game loop
   */
  private async runAIvsAILoop(): Promise<void> {
    const runNextMove = async () => {
      const { gameState, isAIvsAIRunning, aiMoveDelay } = this.state;
      
      if (!isAIvsAIRunning || gameState.winner || gameState.gamePhase !== "playing") {
        this.setState({ isAIvsAIRunning: false });
        return;
      }

      // Execute the current AI move
      await this.checkAITurn();
      
      // Schedule next move with delay
      setTimeout(() => {
        const { isAIvsAIRunning: stillRunning } = this.state;
        if (stillRunning) {
          runNextMove();
        }
      }, aiMoveDelay);
    };

    // Start the loop
    setTimeout(runNextMove, this.state.aiMoveDelay);
  }

  /**
   * Reset game and maintain AI vs AI running state
   */
  async resetGameForAIvsAI(cardPacks: CardPack[] = ["normal"]): Promise<void> {
    const wasRunning = this.state.isAIvsAIRunning;
    await this.resetGame(cardPacks);
    
    if (wasRunning) {
      // Restart AI vs AI after reset
      setTimeout(() => this.startAIvsAI(), 500);
    }
  }
}

// Default game controller instance
export const defaultGameController = new GameController();
