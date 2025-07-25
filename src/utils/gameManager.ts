import {
  Player,
  Piece,
  MoveCard,
  Move,
  GameState,
  PlayerState,
} from "@/types/game";

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
    case piece.isWindSpirit && card.isWindCard:
      // Wind spirits with wind cards use wind_move
      movesToCheck = card.wind_move ?? [];
      break;
    case piece.isWindSpirit && !card.isWindCard:
      // Wind spirits with regular cards use regular moves
      movesToCheck = card.moves;
      break;
    case card.isMockCard && piece.isMaster:
      // Dual cards: masters use master_moves
      movesToCheck = card.master_moves ?? [];
      break;
    case card.isMockCard && !piece.isMaster:
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

// Get possible moves for wind spirit using a regular card
export function getWindSpiritMovesForRegularCard(
  card: MoveCard,
  board: (Piece | null)[][],
  currentPlayer: Player,
  windSpiritPosition: [number, number] | null
): [number, number][] {
  if (!windSpiritPosition) return [];

  const moves: [number, number][] = [];
  const [pieceRow, pieceCol] = windSpiritPosition;

  // Use the regular moves from the card for wind spirit
  const movesToCheck = card.moves;

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

      // Wind spirit can move to empty squares or swap with students (not masters or other wind spirits)
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
// Get all possible moves for the current game state
export function getAllPossibleMoves(
  gameState: GameState,
  selectedPiece: [number, number] | null,
  selectedCard: number | null
): [number, number][] {
  if (!selectedPiece || selectedCard === null) return [];

  const [row, col] = selectedPiece;
  const piece = gameState.board[row][col];
  if (!piece) return [];

  const card = gameState.players[gameState.currentPlayer].cards[selectedCard];

  // If we're in a dual move sequence, only allow wind spirit moves using wind_move
  if (gameState.isDualMoveInProgress) {
    if (!piece.isWindSpirit || !gameState.windSpiritPosition) return [];

    // Wind spirit must use wind_move for the second part of dual move
    const windMoves = card.wind_move ?? [];
    const moves: [number, number][] = [];
    const [pieceRow, pieceCol] = piece.position;

    for (const move of windMoves) {
      let targetRow: number;
      let targetCol: number;

      // Apply move with direction based on current player's turn
      if (gameState.currentPlayer === "red") {
        targetRow = pieceRow - move.y;
        targetCol = pieceCol + move.x;
      } else {
        targetRow = pieceRow + move.y;
        targetCol = pieceCol - move.x;
      }

      // Check if move is valid
      if (isValidPosition(targetRow, targetCol)) {
        const targetPiece = gameState.board[targetRow][targetCol];
        // Wind spirit can move to empty squares or swap with students
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

  // For wind cards during first phase, allow wind spirit moves only if no student/master moves exist
  if (
    card.isWindCard &&
    piece.isWindSpirit &&
    !gameState.isDualMoveInProgress
  ) {
    const hasStudentMasterMoves = hasStudentMasterMovesWithWindCard(
      gameState,
      card
    );
    if (hasStudentMasterMoves) {
      // Can't move wind spirit directly if student/master moves are available
      return [];
    }
    // If no student/master moves, allow direct wind spirit move (skipping first phase)
  }

  // Regular move calculation
  return getPossibleMoves(
    piece,
    card,
    gameState.board,
    gameState.currentPlayer
  );
}

// Check if any student/master pieces have legal moves with a wind card
export function hasStudentMasterMovesWithWindCard(
  gameState: GameState,
  card: MoveCard
): boolean {
  if (!card.isWindCard) return false;

  // Check all pieces belonging to current player
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (
        piece &&
        piece.player === gameState.currentPlayer &&
        !piece.isWindSpirit
      ) {
        // Check if this piece has any legal moves with the card
        const possibleMoves = getPossibleMoves(
          piece,
          card,
          gameState.board,
          gameState.currentPlayer
        );
        if (possibleMoves.length > 0) {
          return true;
        }
      }
    }
  }

  return false;
}

// Validate dual move sequence for wind spirit cards (simplified - moves can be skipped if no legal options)
export function validateDualMoveSequence(
  gameState: GameState,
  from: [number, number],
  cardIndex: number
): boolean {
  const piece = gameState.board[from[0]][from[1]];
  if (!piece) return false;

  const card = gameState.players[gameState.currentPlayer].cards[cardIndex];

  // For wind spirit cards, enforce the rule: must move student/master first if possible
  if (card.isWindCard && !gameState.isDualMoveInProgress) {
    // If trying to move wind spirit directly, check if student/master moves are available
    if (piece.isWindSpirit) {
      const hasStudentMasterMoves = hasStudentMasterMovesWithWindCard(
        gameState,
        card
      );
      if (hasStudentMasterMoves) {
        return false; // Must move student/master first, not wind spirit
      }
    }
    // For student/master moves, always allow - second move will be automatically attempted
  }

  return true;
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

// Helper function to complete turn after wind card usage (when second move is skipped)
function completeTurnAfterWindCard(
  gameState: GameState,
  usedCard: MoveCard,
  cardIndex: number,
  originalGameState: GameState
): GameState {
  const newState = { ...gameState };

  // Handle card exchange and turn switch
  const currentPlayerCards = [
    ...originalGameState.players[originalGameState.currentPlayer].cards,
  ];
  currentPlayerCards[cardIndex] = originalGameState.sharedCard;

  newState.players = {
    ...originalGameState.players,
    [originalGameState.currentPlayer]: {
      ...originalGameState.players[originalGameState.currentPlayer],
      cards: currentPlayerCards,
    },
  };

  const nextPlayer = originalGameState.currentPlayer === "red" ? "blue" : "red";
  const rotatedCard: MoveCard = {
    ...usedCard,
    moves: usedCard.moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    master_moves:
      usedCard.master_moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    student_moves:
      usedCard.student_moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
    wind_move: usedCard.wind_move,
    color: nextPlayer,
  };
  newState.sharedCard = rotatedCard;

  newState.currentPlayer = nextPlayer;
  newState.selectedPiece = null;
  newState.selectedCard = null;

  newState.winner = checkWinConditions(newState);
  if (newState.winner) {
    newState.gamePhase = "finished";
  }

  return newState;
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

  const selectedCard =
    gameState.players[gameState.currentPlayer].cards[cardIndex];
  const isWindSpiritCard = selectedCard.isWindCard;

  // Handle dual move for wind spirit cards
  if (
    isWindSpiritCard &&
    !piece.isWindSpirit &&
    !gameState.isDualMoveInProgress
  ) {
    // First move of a dual move sequence (Student/Master move)
    // Apply the first move (regular piece using top moves)
    newState.board = applyMove(
      gameState.board,
      from,
      to,
      gameState.currentPlayer
    );

    // Update wind spirit position if it was involved in the first move
    const targetPiece = gameState.board[toRow][toCol];
    if (targetPiece?.isWindSpirit && !piece.isMaster && !piece.isWindSpirit) {
      newState.windSpiritPosition = [fromRow, fromCol];
    }

    // Check win conditions after first move
    newState.winner = checkWinConditions(newState);
    if (newState.winner) {
      newState.gamePhase = "finished";
      // Clear dual move state if game ends
      newState.isDualMoveInProgress = false;
      newState.firstMove = undefined;
      newState.selectedPiece = null;
      newState.selectedCard = null;
      return newState;
    }

    // Check if wind spirit has any legal moves for the second part
    if (!gameState.windSpiritPosition) {
      // No wind spirit on board - complete the turn without second move
      return completeTurnAfterWindCard(
        newState,
        selectedCard,
        cardIndex,
        gameState
      );
    }

    const windSpiritPiece: Piece = {
      id: "wind_spirit",
      player: "neutral",
      isMaster: false,
      isWindSpirit: true,
      position: newState.windSpiritPosition as [number, number],
    };

    const windSpiritMoves = getPossibleMoves(
      windSpiritPiece,
      selectedCard,
      newState.board,
      gameState.currentPlayer
    );

    if (windSpiritMoves.length === 0) {
      // No wind spirit moves available - complete the turn without second move
      return completeTurnAfterWindCard(
        newState,
        selectedCard,
        cardIndex,
        gameState
      );
    }

    // Set up for the second move (wind spirit move using bottom moves)
    newState.isDualMoveInProgress = true;
    newState.firstMove = {
      from,
      to,
      cardIndex,
    };
    newState.selectedPiece = newState.windSpiritPosition!; // Auto-select wind spirit (we already checked it exists)
    newState.selectedCard = cardIndex; // Keep the same card selected

    return newState;
  }

  // Handle second move of dual move sequence (wind spirit move)
  if (
    isWindSpiritCard &&
    gameState.isDualMoveInProgress &&
    piece.isWindSpirit
  ) {
    // Apply the wind spirit move
    newState.board = applyMove(
      gameState.board,
      from,
      to,
      gameState.currentPlayer
    );

    // Update wind spirit position
    newState.windSpiritPosition = [toRow, toCol];

    // Complete the dual move sequence
    newState.isDualMoveInProgress = false;
    newState.firstMove = undefined;

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
    const nextPlayer = gameState.currentPlayer === "red" ? "blue" : "red";
    const rotatedCard: MoveCard = {
      ...usedCard,
      // Rotate moves based on card type
      moves: usedCard.moves?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
      // Rotate dual card moves
      master_moves:
        usedCard.master_moves?.map((move) => ({ x: -move.x, y: -move.y })) ??
        [],
      student_moves:
        usedCard.student_moves?.map((move) => ({ x: -move.x, y: -move.y })) ??
        [],
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

  // Handle wind spirit move with wind card (only if no student/master moves available)
  if (
    isWindSpiritCard &&
    piece.isWindSpirit &&
    !gameState.isDualMoveInProgress
  ) {
    // Check if student/master moves are available - if so, this move is invalid
    const hasStudentMasterMoves = hasStudentMasterMovesWithWindCard(
      gameState,
      selectedCard
    );
    if (hasStudentMasterMoves) {
      // Invalid move - must move student/master first
      return gameState;
    }

    // Valid wind spirit only move (no student/master moves available - skip first phase)
    newState.board = applyMove(
      gameState.board,
      from,
      to,
      gameState.currentPlayer
    );

    // Update wind spirit position
    newState.windSpiritPosition = [toRow, toCol];

    // Complete turn using helper function
    return completeTurnAfterWindCard(
      newState,
      selectedCard,
      cardIndex,
      gameState
    );
  }

  // Handle regular moves (non-wind spirit cards or regular pieces with wind spirit cards)
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

// Create initial game state with wind spirit support
export function createInitialGameState(
  board: (Piece | null)[][],
  players: { red: PlayerState; blue: PlayerState },
  sharedCard: MoveCard,
  startingPlayer: Player,
  cardPacks?: ("normal" | "senseis" | "windway" | "promo" | "dual")[]
): GameState {
  const includeWindSpirit = cardPacks?.includes("windway") ?? false;

  return {
    board,
    players,
    sharedCard,
    currentPlayer: startingPlayer,
    selectedPiece: null,
    selectedCard: null,
    windSpiritPosition: includeWindSpirit ? [2, 2] : null,
    winner: null,
    gamePhase: "playing",
    cardPacks,
    isDualMoveInProgress: false,
    firstMove: undefined,
  };
}
