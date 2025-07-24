import { Player, Piece, MoveCard, Move, GameState } from "@/types/game";

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
  board: (Piece | null)[][],
  currentPlayer: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const [pieceRow, pieceCol] = piece.position;

  // Determine which moves to use based on piece type and card type
  let movesToCheck: Move[];
  switch (true) {
    case piece.isWindSpirit:
      // Wind spirits use wind_move if available, otherwise no moves
      movesToCheck = card.wind_move ?? [];
      break;
    case card.isDualCard && piece.isMaster:
      // Dual cards: masters use master_moves
      movesToCheck = card.master_moves ?? [];
      break;
    case card.isDualCard && !piece.isMaster:
      // Dual cards: students use student_moves
      movesToCheck = card.student_moves ?? [];
      break;
    default:
      // Regular cards: all pieces use the same moves
      movesToCheck = card.moves;
      break;
  }

  // Check each move in the card
  for (const move of movesToCheck) {
    let targetRow: number;
    let targetCol: number;

    // Apply move with direction based on current player's turn
    if (currentPlayer === "red") {
      // Red player: y=1 means forward (up, negative row)
      targetRow = pieceRow - move.y;
      targetCol = pieceCol + move.x;
    } else {
      // Blue player: flip the moves (y=1 means forward, which is down for blue)
      targetRow = pieceRow + move.y;
      targetCol = pieceCol - move.x;
    }

    // Check if move is valid
    if (isValidPosition(targetRow, targetCol)) {
      const targetPiece = board[targetRow][targetCol];

      if (piece.isWindSpirit) {
        // Wind spirit can move to empty squares or swap with students (not masters or other wind spirits)
        if (
          !targetPiece ||
          (!targetPiece.isMaster && !targetPiece.isWindSpirit)
        ) {
          moves.push([targetRow, targetCol]);
        }
      } else {
        // Regular pieces can't land on own pieces, but can swap with wind spirits
        if (
          !targetPiece ||
          (targetPiece.player !== piece.player && !targetPiece.isWindSpirit) ||
          (targetPiece.isWindSpirit && !piece.isMaster)
        ) {
          moves.push([targetRow, targetCol]);
        }
      }
    }
  }

  return moves;
}
// Check if a move is valid (works for both regular pieces and wind spirits)

export function isValidMove(
  from: [number, number],
  to: [number, number],
  card: MoveCard,
  board: (Piece | null)[][],
  currentPlayer: Player
): boolean {
  const [fromRow, fromCol] = from;
  const piece = board[fromRow][fromCol];
  if (!piece) return false;

  const possibleMoves = getPossibleMoves(piece, card, board, currentPlayer);
  const isValidMove = possibleMoves.some(
    ([row, col]) => row === to[0] && col === to[1]
  );
  return isValidMove;
}

// Apply move to board (works for both regular pieces and wind spirits)

export function applyMove(
  board: (Piece | null)[][],
  from: [number, number],
  to: [number, number],
  currentPlayer: Player
): (Piece | null)[][] {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  // Check if move is valid
  if (!isValidPosition(toRow, toCol)) {
    return board;
  }

  const piece = board[fromRow][fromCol];
  if (!piece) {
    return board;
  }

  // For wind spirits, any player can move them
  // For regular pieces, only the owner can move them
  if (!piece.isWindSpirit && piece.player !== currentPlayer) {
    return board;
  }

  const targetPiece = board[toRow][toCol];

  // Create new board with move applied
  const newBoard = board.map((row) => [...row]);

  if (
    (piece.isWindSpirit &&
      targetPiece &&
      !targetPiece.isMaster &&
      !targetPiece.isWindSpirit) ||
    (targetPiece?.isWindSpirit && !piece.isMaster && !piece.isWindSpirit)
  ) {
    // Wind spirit swap: handle both wind spirit moving to student or student moving to wind spirit
    const windSpirit = piece.isWindSpirit ? piece : targetPiece!;
    const student = piece.isWindSpirit ? targetPiece! : piece;

    // Elegantly handle wind spirit and student swap
    const [windPos, studentPos] = piece.isWindSpirit
      ? [
          [toRow, toCol],
          [fromRow, fromCol],
        ]
      : [
          [fromRow, fromCol],
          [toRow, toCol],
        ];

    newBoard[windPos[0]][windPos[1]] = {
      ...windSpirit,
      position: windPos as [number, number],
    };
    newBoard[studentPos[0]][studentPos[1]] = {
      ...student,
      position: studentPos as [number, number],
    };
  } else {
    // Regular move or wind spirit to empty square
    newBoard[fromRow][fromCol] = null;
    newBoard[toRow][toCol] = {
      ...piece,
      position: [toRow, toCol] as [number, number],
    };
  }

  return newBoard;
}

// Execute a move (full game state update, works for both regular pieces and wind spirits)
export function executeMove(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = gameState.board[fromRow][fromCol];

  if (!piece) return gameState;

  // Apply the move using the unified applyMove function
  newState.board = applyMove(
    gameState.board,
    from,
    to,
    gameState.currentPlayer
  );

  // Update wind spirit position - handle both moving wind spirit and swapping scenarios
  const targetPiece = gameState.board[toRow][toCol];

  if (piece.isWindSpirit) {
    // Wind spirit is being moved (either to empty square or swapping with student)
    newState.windSpiritPosition = [toRow, toCol];
  } else if (
    targetPiece?.isWindSpirit &&
    !piece.isMaster &&
    !piece.isWindSpirit
  ) {
    // Student is moving into wind spirit position, causing a swap
    // Wind spirit gets moved to the "from" position
    newState.windSpiritPosition = [fromRow, fromCol];
  }

  // If there's no wind spirit involved, keep the existing position
  // (This handles cases where wind spirit exists but isn't part of this move)
  // Handle card exchange (same as before)
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
  const nextPlayer = gameState.currentPlayer === "red" ? "blue" : "red";
  const rotatedCard: MoveCard = {
    ...usedCard,
    // Rotate moves based on card type
    moves: usedCard.moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    // Rotate dual card moves
    master_moves:
      usedCard.master_moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    student_moves:
      usedCard.student_moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    // Keep wind_move unchanged as they use absolute coordinates
    wind_move: usedCard.wind_move,
    color: nextPlayer,
  };
  newState.sharedCard = rotatedCard;

  // Switch turns
  newState.currentPlayer = nextPlayer;

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
