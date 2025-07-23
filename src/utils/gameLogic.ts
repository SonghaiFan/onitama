import {
  GameState,
  MoveCard,
  Piece,
  Player,
  Move,
  SenseisCardPackCard,
} from "@/types/game";

// Convert card data from JSON format to our game format
function convertCardToGameFormat(card: SenseisCardPackCard): MoveCard {
  return {
    name: card.name.en,
    displayName: card.name.zh,
    moves: card.moves,
    wind_move: card.wind_move,
    color: card.firstPlayerColor === "red" ? "red" : "blue",
    isWindSpiritCard: !!card.wind_move || card.type === "wind_spirit",
  };
}

// Fallback cards in case loading fails
const FALLBACK_CARDS: MoveCard[] = [
  {
    name: "Ox",
    displayName: "牛",
    moves: [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
    ],
    color: "blue",
  },
  {
    name: "Horse",
    displayName: "马",
    moves: [
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ],
    color: "red",
  },
  {
    name: "Crab",
    displayName: "蟹",
    moves: [
      { x: -2, y: 0 },
      { x: 0, y: 1 },
      { x: 2, y: 0 },
    ],
    color: "blue",
  },
  {
    name: "Cobra",
    displayName: "蛇",
    moves: [
      { x: 1, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: -1 },
    ],
    color: "red",
  },
  {
    name: "Rabbit",
    displayName: "兔",
    moves: [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: -1, y: -1 },
    ],
    color: "blue",
  },
];

// Function to load card pack data
async function loadCardPack(
  packName: "normal" | "senseis" | "windway"
): Promise<MoveCard[]> {
  try {
    const response = await fetch(`/pack/onitama_16_cards_${packName}.json`);
    const cardData = await response.json();
    return cardData.cards.map(convertCardToGameFormat);
  } catch (error) {
    console.error(`Failed to load ${packName} card pack:`, error);
    // Fallback to basic cards
    return FALLBACK_CARDS;
  }
}

// Cache for loaded card packs
const cardPackCache: Record<string, MoveCard[]> = {};

// Function to get cards for multiple packs
async function getCardsForPacks(
  packNames: ("normal" | "senseis" | "windway")[]
): Promise<MoveCard[]> {
  const allCards: MoveCard[] = [];

  for (const packName of packNames) {
    if (cardPackCache[packName]) {
      allCards.push(...cardPackCache[packName]);
    } else {
      const cards = await loadCardPack(packName);
      cardPackCache[packName] = cards;
      allCards.push(...cards);
    }
  }

  return allCards;
}

// Function to randomly select 5 cards from multiple packs
async function selectRandomCardsAsync(
  cardPacks: ("normal" | "senseis" | "windway")[] = ["normal"]
): Promise<{
  playerCards: MoveCard[];
  sharedCard: MoveCard;
}> {
  const allCards = await getCardsForPacks(cardPacks);
  const shuffled = [...allCards].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
  };
}

// Synchronous version for backward compatibility
function selectRandomCards(): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
} {
  // For now, use the fallback cards
  const shuffled = [...FALLBACK_CARDS].sort(() => Math.random() - 0.5);
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
  board[4][2] = {
    id: "red_master",
    player: "red",
    isMaster: true,
    position: [4, 2],
  }; // Master on Temple Arch
  board[4][0] = {
    id: "red_1",
    player: "red",
    isMaster: false,
    position: [4, 0],
  };
  board[4][1] = {
    id: "red_2",
    player: "red",
    isMaster: false,
    position: [4, 1],
  };
  board[4][3] = {
    id: "red_3",
    player: "red",
    isMaster: false,
    position: [4, 3],
  };
  board[4][4] = {
    id: "red_4",
    player: "red",
    isMaster: false,
    position: [4, 4],
  };

  // Blue player (top) pieces
  board[0][2] = {
    id: "blue_master",
    player: "blue",
    isMaster: true,
    position: [0, 2],
  }; // Master on Temple Arch
  board[0][0] = {
    id: "blue_1",
    player: "blue",
    isMaster: false,
    position: [0, 0],
  };
  board[0][1] = {
    id: "blue_2",
    player: "blue",
    isMaster: false,
    position: [0, 1],
  };
  board[0][3] = {
    id: "blue_3",
    player: "blue",
    isMaster: false,
    position: [0, 3],
  };
  board[0][4] = {
    id: "blue_4",
    player: "blue",
    isMaster: false,
    position: [0, 4],
  };

  return board;
}

// Check if wind spirit should be included based on selected packs
function shouldIncludeWindSpirit(
  cardPacks: ("normal" | "senseis" | "windway")[]
): boolean {
  return cardPacks.includes("windway");
}

// Create initial board with optional wind spirit
function createInitialBoardWithWindSpirit(
  includeWindSpirit: boolean = false
): (Piece | null)[][] {
  const board = createInitialBoard();

  if (includeWindSpirit) {
    // Place wind spirit in center (2, 2)
    board[2][2] = {
      id: "wind_spirit",
      player: "neutral",
      isMaster: false,
      isWindSpirit: true,
      position: [2, 2],
    };
  }

  return board;
}

// Create initial game state
function createInitialGameState(): GameState {
  const { playerCards, sharedCard } = selectRandomCards();

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
    currentPlayer: sharedCard.color,
    selectedPiece: null,
    selectedCard: null,
    windSpiritPosition: null,
    winner: null,
    gamePhase: "playing",
  };
}

export const INITIAL_GAME_STATE: GameState = createInitialGameState();

// Async version for loading card packs
export async function createNewGameAsync(
  cardPacks: ("normal" | "senseis" | "windway")[] = ["normal"]
): Promise<GameState> {
  try {
    const { playerCards, sharedCard } = await selectRandomCardsAsync(cardPacks);
    const includeWindSpirit = shouldIncludeWindSpirit(cardPacks);

    // Validate that we have valid cards
    if (!sharedCard || !playerCards || playerCards.length < 4) {
      console.error("Invalid card selection from async load, using fallback");
      throw new Error("Invalid card selection");
    }

    // Determine starting player based on shared card color
    const startingPlayer = sharedCard.color;

    return {
      board: createInitialBoardWithWindSpirit(includeWindSpirit),
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
      windSpiritPosition: includeWindSpirit ? [2, 2] : null,
      winner: null,
      gamePhase: "playing",
    };
  } catch (error) {
    console.error(
      "Failed to create game with selected pack, using fallback:",
      error
    );
    // Use fallback cards
    const fallbackCards = [...FALLBACK_CARDS];
    const shuffled = fallbackCards.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    const includeWindSpirit = shouldIncludeWindSpirit(cardPacks);

    return {
      board: createInitialBoardWithWindSpirit(includeWindSpirit),
      players: {
        red: {
          cards: [selected[0], selected[1]],
        },
        blue: {
          cards: [selected[2], selected[3]],
        },
      },
      sharedCard: selected[4],
      currentPlayer: selected[4].color,
      selectedPiece: null,
      selectedCard: null,
      windSpiritPosition: includeWindSpirit ? [2, 2] : null,
      winner: null,
      gamePhase: "playing",
    };
  }
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
    // All moves are from red player's perspective:
    // - x: positive = right, negative = left
    // - y: positive = forward (up for red, down for blue)
    let targetRow: number;
    let targetCol: number;

    if (piece.player === "red") {
      // Red player: y=1 means forward (up, negative row)
      targetRow = pieceRow - move.y;
      targetCol = pieceCol + move.x;
    } else {
      // Blue player: flip the moves (y=1 means forward, which is down for blue)
      targetRow = pieceRow + move.y;
      targetCol = pieceCol + move.x;
    }

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

  // Apply move with direction based on player (same logic as getPossibleMoves)
  let tx: number;
  let ty: number;

  if (currentPlayer === "red") {
    // Red player: y=1 means forward (up, negative row)
    tx = fx + move.x;
    ty = fy - move.y;
  } else {
    // Blue player: flip the moves (y=1 means forward, which is down for blue)
    tx = fx + move.x;
    ty = fy + move.y;
  }

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
  // The shared card's color should indicate whose turn it will be next
  const nextPlayer = gameState.currentPlayer === "red" ? "blue" : "red";
  const rotatedCard: MoveCard = {
    ...usedCard,
    moves: usedCard.moves.map((move) => ({ x: -move.x, y: -move.y })),
    color: nextPlayer, // Update color to show who will use this card next
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

// Get possible wind spirit moves
export function getPossibleWindSpiritMoves(
  windSpiritPosition: [number, number],
  card: MoveCard,
  board: (Piece | null)[][]
): [number, number][] {
  if (!card.wind_move) return [];

  const moves: [number, number][] = [];
  const [spiritRow, spiritCol] = windSpiritPosition;

  // Check each wind move in the card
  for (const move of card.wind_move) {
    const targetRow = spiritRow + move.y;
    const targetCol = spiritCol + move.x;

    if (isValidPosition(targetRow, targetCol)) {
      const targetPiece = board[targetRow][targetCol];

      // Wind spirit can only move to empty squares or swap with students
      if (
        !targetPiece ||
        (!targetPiece.isMaster && !targetPiece.isWindSpirit)
      ) {
        moves.push([targetRow, targetCol]);
      }
    }
  }

  return moves;
}

// Check if a wind spirit move is valid
export function isValidWindSpiritMove(
  from: [number, number],
  to: [number, number],
  card: MoveCard,
  board: (Piece | null)[][]
): boolean {
  if (!card.wind_move) return false;

  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  // Check if the move is in the wind_move array
  const moveVector = { x: toCol - fromCol, y: toRow - fromRow };
  const isValidMove = card.wind_move.some(
    (move) => move.x === moveVector.x && move.y === moveVector.y
  );

  if (!isValidMove) return false;

  // Check if target position is valid
  if (!isValidPosition(toRow, toCol)) return false;

  const targetPiece = board[toRow][toCol];

  // Wind spirit can move to empty squares or swap with students (not masters)
  return !targetPiece || (!targetPiece.isMaster && !targetPiece.isWindSpirit);
}

// Apply wind spirit move (including swap logic)
export function applyWindSpiritMove(
  board: (Piece | null)[][],
  from: [number, number],
  to: [number, number]
): (Piece | null)[][] {
  const newBoard = board.map((row) => [...row]);
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const windSpirit = newBoard[fromRow][fromCol];
  const targetPiece = newBoard[toRow][toCol];

  if (!windSpirit?.isWindSpirit) return board;

  // If target is empty, just move wind spirit
  if (!targetPiece) {
    newBoard[toRow][toCol] = {
      ...windSpirit,
      position: [toRow, toCol],
    };
    newBoard[fromRow][fromCol] = null;
  } else {
    // Swap with student piece
    newBoard[toRow][toCol] = {
      ...windSpirit,
      position: [toRow, toCol],
    };
    newBoard[fromRow][fromCol] = {
      ...targetPiece,
      position: [fromRow, fromCol],
    };
  }

  return newBoard;
}
