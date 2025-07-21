import { GameState, MoveCard, Piece, Player, Move } from "@/types/game";
import cardData from "./onitama_16_cards.json";

// Convert card data from JSON format to our game format
function convertCardToGameFormat(card: any): MoveCard {
  return {
    name: card.name.en,
    moves: card.moves,
    color: card.firstPlayerColor === "red" ? "red" : "blue",
  };
}

// Convert all cards and store them
export const ALL_ONITAMA_CARDS: MoveCard[] = cardData.cards.map(
  convertCardToGameFormat
);

// Function to randomly select 5 cards for a game
function selectRandomCards(): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
} {
  const shuffled = [...ALL_ONITAMA_CARDS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
  };
}

// Create initial board setup
function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));

  // Red player (bottom) pieces
  board[4][2] = { player: "red", isMaster: true, position: [4, 2] }; // Master on Temple Arch
  board[4][0] = { player: "red", isMaster: false, position: [4, 0] };
  board[4][1] = { player: "red", isMaster: false, position: [4, 1] };
  board[4][3] = { player: "red", isMaster: false, position: [4, 3] };
  board[4][4] = { player: "red", isMaster: false, position: [4, 4] };

  // Blue player (top) pieces
  board[0][2] = { player: "blue", isMaster: true, position: [0, 2] }; // Master on Temple Arch
  board[0][0] = { player: "blue", isMaster: false, position: [0, 0] };
  board[0][1] = { player: "blue", isMaster: false, position: [0, 1] };
  board[0][3] = { player: "blue", isMaster: false, position: [0, 3] };
  board[0][4] = { player: "blue", isMaster: false, position: [0, 4] };

  return board;
}

// Generate initial game state with random cards
function createInitialGameState(): GameState {
  const { playerCards, sharedCard } = selectRandomCards();

  // Determine starting player based on shared card color
  const startingPlayer = sharedCard.color;

  return {
    board: createInitialBoard(),
    players: {
      red: {
        cards: [playerCards[0], playerCards[1]],
      },
      blue: {
        cards: [playerCards[2], playerCards[3]],
      },
    },
    sharedCard: sharedCard,
    currentPlayer: startingPlayer,
    selectedPiece: null,
    selectedCard: null,
    winner: null,
    gamePhase: "playing",
  };
}

export const INITIAL_GAME_STATE: GameState = createInitialGameState();

// Function to create a new game with different random cards
export function createNewGame(): GameState {
  return createInitialGameState();
}

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 5 && col >= 0 && col < 5;
}

export function isTempleArch(
  row: number,
  col: number,
  player: Player
): boolean {
  if (player === "red") {
    return row === 0 && col === 2; // Top center for red player's goal
  } else {
    return row === 4 && col === 2; // Bottom center for blue player's goal
  }
}

// Get possible moves for a piece using a specific card
export function getPossibleMoves(
  piece: Piece,
  card: MoveCard,
  board: (Piece | null)[][]
): [number, number][] {
  const moves: [number, number][] = [];
  const [pieceRow, pieceCol] = piece.position;

  // Check each move in the card
  for (const move of card.moves) {
    // Apply move with direction based on player
    // Red player moves "forward" (negative y), Blue player moves "backward" (positive y)
    const targetRow = pieceRow + (piece.player === "red" ? -move.y : move.y);
    const targetCol = pieceCol + move.x;

    // Check if move is valid
    if (isValidPosition(targetRow, targetCol)) {
      const targetPiece = board[targetRow][targetCol];

      // Can't land on own piece
      if (!targetPiece || targetPiece.player !== piece.player) {
        moves.push([targetRow, targetCol]);
      }
    }
  }

  return moves;
}

// Check if a move is valid
export function isValidMove(
  from: [number, number],
  to: [number, number],
  card: MoveCard,
  board: (Piece | null)[][]
): boolean {
  const [fromRow, fromCol] = from;
  const piece = board[fromRow][fromCol];
  if (!piece) return false;

  const possibleMoves = getPossibleMoves(piece, card, board);
  return possibleMoves.some(([row, col]) => row === to[0] && col === to[1]);
}

// Apply move to board (based on the user's suggested function)
export function applyMove(
  board: (Piece | null)[][],
  from: [number, number],
  move: Move,
  currentPlayer: Player
): (Piece | null)[][] {
  const [fx, fy] = from;
  const [tx, ty] = [
    fx + move.x,
    fy + (currentPlayer === "red" ? -move.y : move.y),
  ];

  // Check if move is valid
  if (!isValidPosition(tx, ty)) return board;

  const piece = board[fx][fy];
  if (!piece || piece.player !== currentPlayer) return board;

  // Can't land on own piece
  const targetPiece = board[tx][ty];
  if (targetPiece && targetPiece.player === currentPlayer) return board;

  // Create new board with move applied
  const newBoard = board.map((row) => [...row]);

  // Move the piece
  newBoard[fx][fy] = null;
  newBoard[tx][ty] = { ...piece, position: [tx, ty] };

  return newBoard;
}

// Execute a move (full game state update)
export function executeMove(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const newBoard = gameState.board.map((row) => [...row]);

  // Get the piece to move
  const [fromRow, fromCol] = from;
  const piece = newBoard[fromRow][fromCol];
  if (!piece) return gameState;

  // Move the piece
  const [toRow, toCol] = to;
  newBoard[fromRow][fromCol] = null;
  newBoard[toRow][toCol] = { ...piece, position: [toRow, toCol] };

  // Update board
  newState.board = newBoard;

  // Handle card exchange
  const currentPlayerCards = [
    ...gameState.players[gameState.currentPlayer].cards,
  ];
  const usedCard = currentPlayerCards[cardIndex];

  // Remove used card and add shared card
  currentPlayerCards[cardIndex] = gameState.sharedCard;

  // Update player cards
  newState.players = {
    ...gameState.players,
    [gameState.currentPlayer]: {
      ...gameState.players[gameState.currentPlayer],
      cards: currentPlayerCards,
    },
  };

  // Rotate used card and make it shared (flip moves for opposite player)
  const rotatedCard: MoveCard = {
    ...usedCard,
    moves: usedCard.moves.map((move) => ({ x: -move.x, y: -move.y })),
  };
  newState.sharedCard = rotatedCard;

  // Switch turns
  newState.currentPlayer = gameState.currentPlayer === "red" ? "blue" : "red";

  // Clear selections
  newState.selectedPiece = null;
  newState.selectedCard = null;

  // Check win conditions
  newState.winner = checkWinConditions(newState);
  if (newState.winner) {
    newState.gamePhase = "finished";
  }

  return newState;
}

// Check win conditions
export function checkWinConditions(gameState: GameState): Player | null {
  // Way of the Stone: Check if a Master has been captured
  let redHasMaster = false;
  let blueHasMaster = false;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.isMaster) {
        if (piece.player === "red") redHasMaster = true;
        if (piece.player === "blue") blueHasMaster = true;
      }
    }
  }

  if (!redHasMaster) return "blue";
  if (!blueHasMaster) return "red";

  // Way of the Stream: Check if a Master reached opponent's Temple Arch
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.isMaster) {
        if (piece.player === "red" && isTempleArch(row, col, "red")) {
          return "red";
        }
        if (piece.player === "blue" && isTempleArch(row, col, "blue")) {
          return "blue";
        }
      }
    }
  }

  return null;
}

// Convert move card to display pattern (for UI display)
export function getCardDisplayPattern(card: MoveCard): string[][] {
  // Create 5x5 pattern grid for display
  const pattern = Array(5)
    .fill(null)
    .map(() => Array(5).fill(" "));

  // Center is at [2, 2]
  pattern[2][2] = "O";

  // Add moves to pattern
  card.moves.forEach((move) => {
    const displayRow = 2 - move.y; // y=-2 becomes row 4, y=2 becomes row 0
    const displayCol = 2 + move.x; // x=-2 becomes col 0, x=2 becomes col 4

    if (
      displayRow >= 0 &&
      displayRow < 5 &&
      displayCol >= 0 &&
      displayCol < 5
    ) {
      pattern[displayRow][displayCol] = "X";
    }
  });

  return pattern;
}
