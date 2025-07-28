import {
  Player,
  Piece,
  MoveCard,
  Move,
  GameState,
  PlayerState,
} from "@/types/game";

export function isWithinBoard(row: number, col: number): boolean {
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

// ============================================================================
// WIND MOVE LOGIC - REORGANIZED
// ============================================================================

/**
 * Determines which moves to use based on piece type and card type
 */
function getMovesForPiece(piece: Piece, card: MoveCard): Move[] {
  if (piece.isWindSpirit && card.isWindCard) {
    // Wind spirits with wind cards use wind_move
    return card.wind_move ?? [];
  } else if (card.isMockCard && piece.isMaster) {
    // Dual cards: masters use master_moves
    return card.master_moves ?? [];
  } else if (card.isMockCard && !piece.isMaster) {
    // Dual cards: students use student_moves
    return card.student_moves ?? [];
  } else {
    // Regular cards: all pieces use the same moves
    return card.moves;
  }
}

/**
 * Check if a move is a wind spirit swap
 */
export function isWindSpiritSwap(
  fromPiece: Piece | null,
  toPiece: Piece | null
): boolean {
  if (!fromPiece || !toPiece) return false;

  return !!(
    (fromPiece.isWindSpirit && !toPiece.isMaster && !toPiece.isWindSpirit) ||
    (toPiece.isWindSpirit && !fromPiece.isMaster && !fromPiece.isWindSpirit)
  );
}

/**
 * Check if a move is a master capture
 */
export function isMasterCapture(
  fromPiece: Piece | null,
  toPiece: Piece | null
): boolean {
  if (!fromPiece || !toPiece) return false;

  return toPiece.isMaster;
}

/**
 * Check if a target position is valid for a piece to move to
 */
function isValidTargetPosition(
  piece: Piece,
  targetPiece: Piece | null
): boolean {
  if (piece.isWindSpirit) {
    // Wind spirit can move to empty squares or swap with students (not masters)
    return !targetPiece || !targetPiece.isMaster;
  } else {
    // Regular pieces can't land on own pieces or wind spirits
    return !!(
      !targetPiece ||
      (targetPiece.player !== piece.player && !targetPiece.isWindSpirit)
    );
  }
}

/**
 * Get possible moves for a piece using a specific card
 */
export function getPossibleMoves(
  piece: Piece,
  card: MoveCard,
  board: (Piece | null)[][],
  currentPlayer: Player
): [number, number][] {
  const moves: [number, number][] = [];
  const [pieceRow, pieceCol] = piece.position;
  const movesToCheck = getMovesForPiece(piece, card);

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
    if (isWithinBoard(targetRow, targetCol)) {
      const targetPiece = board[targetRow][targetCol];
      if (isValidTargetPosition(piece, targetPiece)) {
        moves.push([targetRow, targetCol]);
      }
    }
  }

  return moves;
}

/**
 * Check if any student/master pieces have legal moves with a wind card
 */
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

/**
 * Validate if a wind spirit move is allowed (must move student/master first if possible)
 */
export function validateWindSpiritMove(
  gameState: GameState,
  piece: Piece,
  card: MoveCard
): boolean {
  if (!card.isWindCard || !piece.isWindSpirit) return true;

  // Wind spirits can only move directly if no student/master moves are available
  return !hasStudentMasterMovesWithWindCard(gameState, card);
}

// ============================================================================
// WIND DUAL MOVE LOGIC
// ============================================================================

/**
 * Handle the first move of a wind spirit dual move sequence
 */
function handleWindDualMoveFirst(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;
  const piece = gameState.board[fromRow][fromCol]!;

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
    return newState;
  }

  // Check if wind spirit has any legal moves for the second part
  if (!gameState.windSpiritPosition) {
    // No wind spirit on board - complete the turn without second move
    return completeTurnAfterWindCard(
      newState,
      gameState.players[gameState.currentPlayer].cards[cardIndex],
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
    gameState.players[gameState.currentPlayer].cards[cardIndex],
    newState.board,
    gameState.currentPlayer
  );

  if (windSpiritMoves.length === 0) {
    // No wind spirit moves available - complete the turn without second move
    return completeTurnAfterWindCard(
      newState,
      gameState.players[gameState.currentPlayer].cards[cardIndex],
      cardIndex,
      gameState
    );
  }

  // Set up for the second move (wind spirit move using bottom moves)
  newState.isDualMoveInProgress = true;
  newState.firstMove = { from, to, cardIndex };
  newState.selectedPiece = newState.windSpiritPosition!;
  newState.selectedCard = cardIndex;

  return newState;
}

/**
 * Handle the second move of a wind spirit dual move sequence
 */
function handleWindDualMoveSecond(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const [toRow, toCol] = to;

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

  // Handle card exchange and turn switch
  return completeTurnAfterWindCard(
    newState,
    gameState.players[gameState.currentPlayer].cards[cardIndex],
    cardIndex,
    gameState
  );
}

/**
 * Handle wind spirit direct move (when no student/master moves are available)
 */
function handleWindSpiritDirectMove(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const newState = { ...gameState };
  const [toRow, toCol] = to;

  // Apply the wind spirit move
  newState.board = applyMove(
    gameState.board,
    from,
    to,
    gameState.currentPlayer
  );

  // Update wind spirit position
  newState.windSpiritPosition = [toRow, toCol];

  // Complete turn
  return completeTurnAfterWindCard(
    newState,
    gameState.players[gameState.currentPlayer].cards[cardIndex],
    cardIndex,
    gameState
  );
}

// ============================================================================
// CORE GAME LOGIC
// ============================================================================

/**
 * Get all possible moves for the current game state
 */
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
      if (isWithinBoard(targetRow, targetCol)) {
        const targetPiece = gameState.board[targetRow][targetCol];
        if (isValidTargetPosition(piece, targetPiece)) {
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
  }

  // Regular move calculation
  return getPossibleMoves(
    piece,
    card,
    gameState.board,
    gameState.currentPlayer
  );
}

/**
 * Validate dual move sequence for wind spirit cards
 */
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
  }

  return true;
}

/**
 * Check if a move is valid
 */
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
  return possibleMoves.some(([row, col]) => row === to[0] && col === to[1]);
}

/**
 * Apply move to board
 */
export function applyMove(
  board: (Piece | null)[][],
  from: [number, number],
  to: [number, number],
  currentPlayer: Player
): (Piece | null)[][] {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  // Check if move is valid
  if (!isWithinBoard(toRow, toCol)) {
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

    // Preserve the original wind spirit object to maintain layout animation
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

/**
 * Helper function to complete turn after wind card usage
 */
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
    wind_move:
      usedCard.wind_move?.map((move) => ({ x: -move.x, y: -move.y })) ?? [],
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

/**
 * Execute a move (full game state update)
 */
export function executeMove(
  gameState: GameState,
  from: [number, number],
  to: [number, number],
  cardIndex: number
): GameState {
  const piece = gameState.board[from[0]][from[1]];
  if (!piece) return gameState;

  const selectedCard =
    gameState.players[gameState.currentPlayer].cards[cardIndex];
  const isWindSpiritCard = selectedCard.isWindCard;

  // ============================================================================
  // WIND SPIRIT DUAL MOVE LOGIC
  // ============================================================================

  // Handle first move of wind spirit dual move sequence
  if (
    isWindSpiritCard &&
    !piece.isWindSpirit &&
    !gameState.isDualMoveInProgress
  ) {
    return handleWindDualMoveFirst(gameState, from, to, cardIndex);
  }

  // Handle second move of wind spirit dual move sequence
  if (
    isWindSpiritCard &&
    gameState.isDualMoveInProgress &&
    piece.isWindSpirit
  ) {
    return handleWindDualMoveSecond(gameState, from, to, cardIndex);
  }

  // Handle wind spirit direct move (when no student/master moves available)
  if (
    isWindSpiritCard &&
    piece.isWindSpirit &&
    !gameState.isDualMoveInProgress
  ) {
    // Validate that no student/master moves are available
    const hasStudentMasterMoves = hasStudentMasterMovesWithWindCard(
      gameState,
      selectedCard
    );
    if (hasStudentMasterMoves) {
      return gameState; // Invalid move - must move student/master first
    }
    return handleWindSpiritDirectMove(gameState, from, to, cardIndex);
  }

  // ============================================================================
  // REGULAR MOVE LOGIC
  // ============================================================================

  const newState = { ...gameState };
  const [toRow, toCol] = to;

  // Apply the move
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
    newState.windSpiritPosition = [from[0], from[1]];
  }

  // Handle card exchange and turn switch
  return completeTurnAfterWindCard(
    newState,
    selectedCard,
    cardIndex,
    gameState
  );
}

// ============================================================================
// WIN CONDITIONS AND UTILITIES
// ============================================================================

/**
 * Check win conditions
 */
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

/**
 * Convert move card to display pattern (for UI display)
 */
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

/**
 * Create initial game state with wind spirit support
 */
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

/**
 * Enhanced move generation for AI - returns moves with metadata
 */
export interface MoveWithMetadata {
  from: [number, number];
  to: [number, number];
  cardIndex: number;
  piece: Piece;
  card: MoveCard;
  score?: number; // For AI evaluation
  isCapture?: boolean;
  isMasterMove?: boolean;
  isWindSpiritMove?: boolean;
  distanceToGoal?: number;
}

/**
 * Get all possible moves for a player with metadata
 */
export function getAllPlayerMoves(
  gameState: GameState,
  player: Player
): MoveWithMetadata[] {
  const moves: MoveWithMetadata[] = [];

  // Check all pieces belonging to the player
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.player === player) {
        // Check each card
        for (
          let cardIndex = 0;
          cardIndex < gameState.players[player].cards.length;
          cardIndex++
        ) {
          const card = gameState.players[player].cards[cardIndex];
          const possibleMoves = getPossibleMoves(
            piece,
            card,
            gameState.board,
            player
          );

          for (const [toRow, toCol] of possibleMoves) {
            const targetPiece = gameState.board[toRow][toCol];
            const isCapture = !!targetPiece && targetPiece.player !== player;
            const isMasterMove = piece.isMaster;
            const isWindSpiritMove = piece.isWindSpirit;

            // Calculate distance to opponent's goal
            const goalRow = player === "red" ? 4 : 0; // Red goes to bottom, Blue goes to top
            const distanceToGoal =
              Math.abs(toRow - goalRow) + Math.abs(toCol - 2);

            moves.push({
              from: [row, col],
              to: [toRow, toCol],
              cardIndex,
              piece,
              card,
              isCapture,
              isMasterMove,
              isWindSpiritMove,
              distanceToGoal,
            });
          }
        }
      }
    }
  }

  // Also check wind spirit moves if available
  if (gameState.windSpiritPosition) {
    const windSpiritPiece: Piece = {
      id: "wind_spirit",
      player: "neutral",
      isMaster: false,
      isWindSpirit: true,
      position: gameState.windSpiritPosition,
    };

    for (
      let cardIndex = 0;
      cardIndex < gameState.players[player].cards.length;
      cardIndex++
    ) {
      const card = gameState.players[player].cards[cardIndex];
      const possibleMoves = getPossibleMoves(
        windSpiritPiece,
        card,
        gameState.board,
        player
      );

      for (const [toRow, toCol] of possibleMoves) {
        const targetPiece = gameState.board[toRow][toCol];
        const isCapture = !!targetPiece && targetPiece.player !== player;

        moves.push({
          from: gameState.windSpiritPosition!,
          to: [toRow, toCol],
          cardIndex,
          piece: windSpiritPiece,
          card,
          isCapture,
          isMasterMove: false,
          isWindSpiritMove: true,
          distanceToGoal: 0, // Wind spirit doesn't have a goal
        });
      }
    }
  }

  return moves;
}

/**
 * Evaluate a game state for AI decision making
 */
export function evaluateGameState(
  gameState: GameState,
  player: Player
): number {
  let score = 0;
  const opponent = player === "red" ? "blue" : "red";

  // Check win conditions first
  if (gameState.winner === player) return 1000;
  if (gameState.winner === opponent) return -1000;

  // Count pieces
  let playerPieces = 0;
  let opponentPieces = 0;
  let playerMaster = false;
  let opponentMaster = false;

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        if (piece.player === player) {
          playerPieces++;
          if (piece.isMaster) playerMaster = true;
          // Bonus for master being close to opponent's goal
          if (piece.isMaster) {
            const goalRow = player === "red" ? 4 : 0;
            const distanceToGoal = Math.abs(row - goalRow) + Math.abs(col - 2);
            score += (5 - distanceToGoal) * 10; // Closer is better
          }
        } else if (piece.player === opponent) {
          opponentPieces++;
          if (piece.isMaster) opponentMaster = true;
        }
      }
    }
  }

  // Piece count advantage
  score += (playerPieces - opponentPieces) * 5;

  // Master survival bonus
  if (playerMaster) score += 50;
  if (!opponentMaster) score += 100; // Opponent lost their master

  // Wind spirit position bonus (if applicable)
  if (gameState.windSpiritPosition) {
    const [windRow, windCol] = gameState.windSpiritPosition;
    // Bonus for wind spirit being in advantageous position
    const centerDistance = Math.abs(windRow - 2) + Math.abs(windCol - 2);
    score += (5 - centerDistance) * 2; // Closer to center is better
  }

  return score;
}

/**
 * Get the best move using simple evaluation (for MVP AI)
 */
export function getBestMove(
  gameState: GameState,
  player: Player
): MoveWithMetadata | null {
  const allMoves = getAllPlayerMoves(gameState, player);
  if (allMoves.length === 0) return null;

  let bestMove: MoveWithMetadata | null = null;
  let bestScore = -Infinity;

  for (const move of allMoves) {
    // Simulate the move
    const simulatedState = executeMove(
      gameState,
      move.from,
      move.to,
      move.cardIndex
    );
    const score = evaluateGameState(simulatedState, player);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
