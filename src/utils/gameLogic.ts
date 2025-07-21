import { GameState, MoveCard, GamePiece, Position, Player } from "@/types/game";

export const SAMPLE_MOVE_CARDS: MoveCard[] = [
  {
    name: "Tiger",
    pattern: [
      [" ", "X", " "],
      [" ", "O", " "],
      [" ", "X", " "],
    ],
    color: "player1",
  },
  {
    name: "Dragon",
    pattern: [
      ["X", " ", " "],
      [" ", "O", "X"],
      [" ", " ", " "],
    ],
    color: "player1",
  },
  {
    name: "Frog",
    pattern: [
      [" ", "X", " "],
      ["X", "O", " "],
      [" ", "X", " "],
    ],
    color: "player2",
  },
  {
    name: "Rabbit",
    pattern: [
      [" ", " ", "X"],
      [" ", "O", "X"],
      [" ", " ", " "],
    ],
    color: "player2",
  },
  {
    name: "Crab",
    pattern: [
      [" ", "X", " "],
      ["X", "O", "X"],
      [" ", " ", " "],
    ],
    color: "player1",
  },
];

// Create initial board setup
function createInitialBoard(): (GamePiece | null)[][] {
  const board: (GamePiece | null)[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));

  // Player 1 (bottom) pieces
  board[4][2] = {
    type: "master",
    player: "player1",
    position: { row: 4, col: 2 },
  }; // Master on Temple Arch
  board[4][0] = {
    type: "student",
    player: "player1",
    position: { row: 4, col: 0 },
  };
  board[4][1] = {
    type: "student",
    player: "player1",
    position: { row: 4, col: 1 },
  };
  board[4][3] = {
    type: "student",
    player: "player1",
    position: { row: 4, col: 3 },
  };
  board[4][4] = {
    type: "student",
    player: "player1",
    position: { row: 4, col: 4 },
  };

  // Player 2 (top) pieces
  board[0][2] = {
    type: "master",
    player: "player2",
    position: { row: 0, col: 2 },
  }; // Master on Temple Arch
  board[0][0] = {
    type: "student",
    player: "player2",
    position: { row: 0, col: 0 },
  };
  board[0][1] = {
    type: "student",
    player: "player2",
    position: { row: 0, col: 1 },
  };
  board[0][3] = {
    type: "student",
    player: "player2",
    position: { row: 0, col: 3 },
  };
  board[0][4] = {
    type: "student",
    player: "player2",
    position: { row: 0, col: 4 },
  };

  return board;
}

export const INITIAL_GAME_STATE: GameState = {
  board: createInitialBoard(),
  players: {
    player1: {
      cards: [SAMPLE_MOVE_CARDS[0], SAMPLE_MOVE_CARDS[1]],
    },
    player2: {
      cards: [SAMPLE_MOVE_CARDS[2], SAMPLE_MOVE_CARDS[3]],
    },
  },
  sharedCard: SAMPLE_MOVE_CARDS[4],
  currentPlayer: "player1",
  selectedPiece: null,
  selectedCard: null,
  winner: null,
  gamePhase: "playing",
};

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 5 && col >= 0 && col < 5;
}

export function isTempleArch(
  row: number,
  col: number,
  player: "player1" | "player2"
): boolean {
  if (player === "player1") {
    return row === 0 && col === 2; // Top center for player 1's goal
  } else {
    return row === 4 && col === 2; // Bottom center for player 2's goal
  }
}

// Get possible moves for a piece using a specific card
export function getPossibleMoves(
  piece: GamePiece,
  card: MoveCard,
  board: (GamePiece | null)[][]
): Position[] {
  const moves: Position[] = [];
  const { row: pieceRow, col: pieceCol } = piece.position;

  // Find the center of the pattern (marked with 'O')
  let patternCenterRow = -1;
  let patternCenterCol = -1;

  for (let i = 0; i < card.pattern.length; i++) {
    for (let j = 0; j < card.pattern[i].length; j++) {
      if (card.pattern[i][j] === "O") {
        patternCenterRow = i;
        patternCenterCol = j;
        break;
      }
    }
    if (patternCenterRow !== -1) break;
  }

  if (patternCenterRow === -1) return moves; // Invalid card pattern

  // Check each 'X' in the pattern
  for (let i = 0; i < card.pattern.length; i++) {
    for (let j = 0; j < card.pattern[i].length; j++) {
      if (card.pattern[i][j] === "X") {
        // Calculate relative position from center
        const deltaRow = i - patternCenterRow;
        const deltaCol = j - patternCenterCol;

        // Apply rotation based on player (player2 sees cards rotated 180°)
        let actualDeltaRow = deltaRow;
        let actualDeltaCol = deltaCol;

        if (piece.player === "player2") {
          actualDeltaRow = -deltaRow;
          actualDeltaCol = -deltaCol;
        }

        // Calculate target position
        const targetRow = pieceRow + actualDeltaRow;
        const targetCol = pieceCol + actualDeltaCol;

        // Check if move is valid
        if (isValidPosition(targetRow, targetCol)) {
          const targetPiece = board[targetRow][targetCol];

          // Can't land on own piece
          if (!targetPiece || targetPiece.player !== piece.player) {
            moves.push({ row: targetRow, col: targetCol });
          }
        }
      }
    }
  }

  return moves;
}

// Check if a move is valid
export function isValidMove(
  from: Position,
  to: Position,
  card: MoveCard,
  board: (GamePiece | null)[][]
): boolean {
  const piece = board[from.row][from.col];
  if (!piece) return false;

  const possibleMoves = getPossibleMoves(piece, card, board);
  return possibleMoves.some(
    (move) => move.row === to.row && move.col === to.col
  );
}

// Execute a move
export function executeMove(
  gameState: GameState,
  from: Position,
  to: Position,
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const newBoard = gameState.board.map((row) => [...row]);

  // Get the piece to move
  const piece = newBoard[from.row][from.col];
  if (!piece) return gameState;

  // Update piece position
  const movedPiece = { ...piece, position: to };

  // Move the piece
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = movedPiece;

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

  // Rotate used card and make it shared
  const rotatedCard = {
    ...usedCard,
    pattern: usedCard.pattern
      .slice()
      .reverse()
      .map((row) => row.slice().reverse()),
  };
  newState.sharedCard = rotatedCard;

  // Switch turns
  newState.currentPlayer =
    gameState.currentPlayer === "player1" ? "player2" : "player1";

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
  let player1HasMaster = false;
  let player2HasMaster = false;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.type === "master") {
        if (piece.player === "player1") player1HasMaster = true;
        if (piece.player === "player2") player2HasMaster = true;
      }
    }
  }

  if (!player1HasMaster) return "player2";
  if (!player2HasMaster) return "player1";

  // Way of the Stream: Check if a Master reached opponent's Temple Arch
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.type === "master") {
        if (piece.player === "player1" && isTempleArch(row, col, "player1")) {
          return "player1";
        }
        if (piece.player === "player2" && isTempleArch(row, col, "player2")) {
          return "player2";
        }
      }
    }
  }

  return null;
}
