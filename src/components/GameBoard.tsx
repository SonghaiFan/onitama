"use client";

import { GameState, Piece } from "@/types/game";
import {
  isTempleArch,
  isValidMove,
  getAllPossibleMoves,
  isWindSpiritSwap,
  isMasterCapture,
} from "@/utils/gameManager";
import { useState, useCallback, useEffect, useRef } from "react";
import { DraggablePiece, DragOverlay } from "./GamePiece";
import { DroppableCell } from "./GameCell";
import { useSound } from "react-sounds";

interface GameBoardProps {
  gameState: GameState;
  onPieceClick: (position: [number, number]) => void;
  onCardSelect?: (cardIndex: number) => void;
  onPieceMove?: (
    from: [number, number],
    to: [number, number],
    cardIndex: number
  ) => void;
}

interface DraggedPieceData {
  position: [number, number];
  piece: Piece;
  cardIndex: number;
}

interface DragState {
  isDragging: boolean;
  draggedPiece: DraggedPieceData | null;
  dragPosition: { x: number; y: number } | null;
  isRightDrag: boolean;
}

export default function GameBoard({
  gameState,
  onPieceClick,
  onCardSelect,
  onPieceMove,
}: GameBoardProps) {
  // Use ref to access current gameState in callbacks to avoid stale closures
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Sound effects
  const { play: playMoveSound } = useSound("/sounds/move.mp3");
  const { play: playCaptureSound } = useSound("/sounds/capture.mp3");
  const { play: playSwapSound } = useSound("/sounds/move-self.mp3");
  const { play: playMasterCaptureSound } = useSound("/sounds/promote.mp3");

  // Unified drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPiece: null,
    dragPosition: null,
    isRightDrag: false,
  });

  // Track touched cell for z-index management
  const [touchedCell, setTouchedCell] = useState<string | null>(null);

  // Prevent context menu on the entire board
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Unified drag start handler
  const handleDragStart = useCallback(
    (e: React.MouseEvent, piece: Piece, position: [number, number]) => {
      e.preventDefault();

      // Only allow mouse-based dragging, not touch-based
      // Check if this is a touch event by looking at the event type or properties
      if (
        e.type === "touchstart" ||
        e.type === "touchmove" ||
        e.type === "touchend"
      ) {
        return;
      }

      const isRightDrag = e.button === 2;
      const cardIndex = isRightDrag ? 1 : 0; // Right = card 1, Left = card 0

      // Allow dragging if:
      // 1. It's the current player's piece, OR
      // 2. It's a wind spirit (both players can move wind spirits)
      const canDrag =
        (piece.player === gameStateRef.current.currentPlayer ||
          !!piece.isWindSpirit) &&
        !gameStateRef.current.winner;

      if (canDrag) {
        // Play select sound when starting to drag a piece
        // Removed playSelectSound()

        // Update game state to select the card for consistent highlighting
        if (onCardSelect) {
          onCardSelect(cardIndex);
        }

        setDragState({
          isDragging: true,
          draggedPiece: {
            position,
            piece,
            cardIndex,
          },
          dragPosition: { x: e.clientX, y: e.clientY },
          isRightDrag,
        });
      }
    },
    [onCardSelect]
  );

  // Handle mouse move for drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragState.isDragging) {
        setDragState((prev) => ({
          ...prev,
          dragPosition: { x: e.clientX, y: e.clientY },
        }));
      }
    },
    [dragState.isDragging]
  );

  // Handle mouse up for drag end
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (dragState.isDragging && dragState.draggedPiece) {
        // Find the cell under the mouse
        const element = document.elementFromPoint(e.clientX, e.clientY);

        if (element) {
          const cellElement = element.closest('[data-cell-id^="cell-"]');

          if (cellElement) {
            const cellId = cellElement.getAttribute("data-cell-id");
            const parts = cellId?.split("-");

            if (parts && parts.length === 3) {
              const targetRow = parseInt(parts[1]);
              const targetCol = parseInt(parts[2]);

              // Use the current gameState from ref to avoid stale closure issues
              const currentPlayer = gameStateRef.current.currentPlayer;
              const currentBoard = gameStateRef.current.board;
              const currentPlayerCards =
                gameStateRef.current.players[currentPlayer].cards;

              // Check if it's a valid move using the isValidMove function
              const moveIsValid = isValidMove(
                dragState.draggedPiece.position,
                [targetRow, targetCol],
                currentPlayerCards[dragState.draggedPiece.cardIndex],
                currentBoard,
                currentPlayer
              );

              if (moveIsValid && onPieceMove) {
                // Play appropriate sound based on the target
                const targetPiece = currentBoard[targetRow][targetCol];
                const draggedPiece =
                  currentBoard[dragState.draggedPiece.position[0]][
                    dragState.draggedPiece.position[1]
                  ];

                if (targetPiece) {
                  // Check if this is a wind spirit swap
                  const isWindSwap = isWindSpiritSwap(
                    draggedPiece,
                    targetPiece
                  );
                  const isMasterCap = isMasterCapture(
                    draggedPiece,
                    targetPiece
                  );

                  if (isWindSwap) {
                    // Play swap sound for wind spirit swaps
                    playSwapSound();
                  } else if (isMasterCap) {
                    // Play master capture sound for capturing masters
                    playMasterCaptureSound();
                  } else {
                    // Play capture sound for regular captures
                    playCaptureSound();
                  }
                } else {
                  playMoveSound();
                }

                onPieceMove(
                  dragState.draggedPiece.position,
                  [targetRow, targetCol],
                  dragState.draggedPiece.cardIndex
                );
              }
            }
          }
        }

        // Reset drag state
        setDragState({
          isDragging: false,
          draggedPiece: null,
          dragPosition: null,
          isRightDrag: false,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dragState.isDragging, dragState.draggedPiece, onPieceMove]
  );

  // Set up global event listeners for drag
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // Handle cell touch for z-index management
  const handleCellTouchStart = useCallback((cellId: string) => {
    setTouchedCell(cellId);
  }, []);

  const handleCellTouchEnd = useCallback(() => {
    // Delay clearing touched cell to allow for smooth transitions
    setTimeout(() => {
      setTouchedCell(null);
    }, 100);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    // Don't trigger click if we're dragging
    if (dragState.isDragging) return;

    // If there are possible moves and we click on an empty cell,
    // we should make the move
    const hasPossibleMoves = possibleMoves.length > 0;
    const clickedPiece = gameState.board[row][col];

    if (hasPossibleMoves && !clickedPiece) {
      // Check if this is a valid move target (empty cell)
      const isValidMoveTarget = possibleMoves.some(
        ([moveRow, moveCol]) => moveRow === row && moveCol === col
      );

      if (
        isValidMoveTarget &&
        onPieceMove &&
        gameState.selectedPiece &&
        gameState.selectedCard !== null
      ) {
        // Play move sound for moving to empty space
        playMoveSound();

        // Execute the move
        onPieceMove(
          gameState.selectedPiece,
          [row, col],
          gameState.selectedCard
        );
        return;
      }
    }

    // If there are possible moves and we click on a piece,
    // check if it's a valid capture move
    if (hasPossibleMoves && clickedPiece) {
      // Check if this is a valid move target (capture)
      const isValidMoveTarget = possibleMoves.some(
        ([moveRow, moveCol]) => moveRow === row && moveCol === col
      );

      if (
        isValidMoveTarget &&
        onPieceMove &&
        gameState.selectedPiece &&
        gameState.selectedCard !== null
      ) {
        // Check if this is a wind spirit swap
        const selectedPiece =
          gameState.board[gameState.selectedPiece[0]][
            gameState.selectedPiece[1]
          ];
        const isWindSwap = isWindSpiritSwap(selectedPiece, clickedPiece);
        const isMasterCap = isMasterCapture(selectedPiece, clickedPiece);

        if (isWindSwap) {
          // Play swap sound for wind spirit swaps
          playSwapSound();
        } else if (isMasterCap) {
          // Play master capture sound for capturing masters
          playMasterCaptureSound();
        } else {
          // Play capture sound for regular captures
          playCaptureSound();
        }

        // Execute the move
        onPieceMove(
          gameState.selectedPiece,
          [row, col],
          gameState.selectedCard
        );
        return;
      }
    }

    // Check if the clicked piece can be selected
    if (clickedPiece) {
      const canSelectPiece =
        clickedPiece.player === gameState.currentPlayer ||
        clickedPiece.isWindSpirit;

      if (canSelectPiece) {
        // Handle as piece selection
        onPieceClick([row, col]);
        return;
      }
    }

    // If no piece or piece can't be selected, still try to select the cell
    // (this allows selecting empty cells for moves)
    onPieceClick([row, col]);
  };

  // Calculate possible moves when both piece and card are selected OR when dragging
  const possibleMoves: [number, number][] = (() => {
    const piecePosition =
      dragState.draggedPiece?.position || gameState.selectedPiece;
    if (!piecePosition) return [];

    const [row, col] = piecePosition;
    const piece = gameState.board[row][col];
    if (!piece) return [];

    // Use the selected card from game state for consistent highlighting
    // When dragging, the card should already be selected via onCardSelect
    const cardIndex = gameState.selectedCard;
    if (cardIndex === null || cardIndex === undefined) return [];

    return getAllPossibleMoves(gameState, piecePosition, cardIndex);
  })();

  const renderPiece = (
    piece: Piece | null,
    isSelected: boolean = false,
    row?: number,
    col?: number
  ) => {
    if (!piece || row === undefined || col === undefined) return null;

    // Allow dragging if:
    // 1. It's the current player's piece, OR
    // 2. It's a wind spirit (both players can move wind spirits)
    const canDrag =
      (piece.player === gameState.currentPlayer || !!piece.isWindSpirit) &&
      !gameState.winner;

    const isDraggedPiece =
      dragState.isDragging &&
      dragState.draggedPiece?.position[0] === row &&
      dragState.draggedPiece?.position[1] === col;

    return (
      <DraggablePiece
        piece={piece}
        row={row}
        col={col}
        isSelected={isSelected}
        canDrag={canDrag}
        isDraggedPiece={isDraggedPiece}
        selectedCardIndex={gameState.selectedCard ?? undefined}
        onDragStart={handleDragStart}
      />
    );
  };

  return (
    <div
      className="game-board neoprene-mat scroll-texture p-0.5 sm:p-1 md:p-2 lg:p-4 border border-stone-300 shadow-2xl"
      onContextMenu={handleContextMenu}
    >
      <div className="grid grid-cols-5 gap-0.25 sm:gap-0.5 md:gap-1 lg:gap-1.5 bg-stone-100 p-0.5 sm:p-1 md:p-2 lg:p-3 border border-stone-200 shadow-inner ink-wash aspect-square">
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 5 }, (_, col) => {
            const piece = gameState.board[row][col];
            const isRedTempleArch = isTempleArch(row, col, "red");
            const isBlueTempleArch = isTempleArch(row, col, "blue");
            const isSelected =
              gameState.selectedPiece?.[0] === row &&
              gameState.selectedPiece?.[1] === col;
            const isPossibleMove = possibleMoves.some(
              ([moveRow, moveCol]) => moveRow === row && moveCol === col
            );

            const cellId = `cell-${row}-${col}`;
            const isTouched = touchedCell === cellId;

            return (
              <DroppableCell
                key={`${row}-${col}`}
                row={row}
                col={col}
                isPossibleMove={isPossibleMove}
                isSelected={isSelected}
                isRedTempleArch={isRedTempleArch}
                isBlueTempleArch={isBlueTempleArch}
                isDragging={dragState.isDragging}
                dragCardIndex={dragState.draggedPiece?.cardIndex}
                isTouched={isTouched}
                onClick={() => handleCellClick(row, col)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCellClick(row, col)
                }
                onTouchStart={() => handleCellTouchStart(cellId)}
                onTouchEnd={handleCellTouchEnd}
              >
                {piece && renderPiece(piece, isSelected, row, col)}
              </DroppableCell>
            );
          })
        )}
      </div>

      {/* Custom drag overlay */}
      {dragState.isDragging &&
        dragState.draggedPiece &&
        dragState.dragPosition && (
          <div className="fixed inset-0 w-full h-full pointer-events-none z-9999">
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: dragState.dragPosition.x,
                top: dragState.dragPosition.y,
              }}
            >
              <DragOverlay
                piece={dragState.draggedPiece.piece}
                cardIndex={dragState.draggedPiece.cardIndex}
              />
            </div>
          </div>
        )}
    </div>
  );
}
