"use client";

import { GameState, Piece } from "@/types/game";
import { isTempleArch, getPossibleMoves } from "@/utils/gameLogic";
import { useState, useCallback, useEffect, useRef } from "react";
import { DraggablePiece, DragOverlay } from "./GamePiece";
import { DroppableCell } from "./GameCell";

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

  // Unified drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPiece: null,
    dragPosition: null,
    isRightDrag: false,
  });

  // Prevent context menu on the entire board
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Unified drag start handler
  const handleDragStart = useCallback(
    (e: React.MouseEvent, piece: Piece, position: [number, number]) => {
      e.preventDefault();

      const isRightDrag = e.button === 2;
      const cardIndex = isRightDrag ? 1 : 0; // Right = card 1, Left = card 0

      if (
        piece.player === gameStateRef.current.currentPlayer &&
        !gameStateRef.current.winner
      ) {
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

              // Check if it's a valid move using the existing possibleMoves logic
              const possibleMoves = getPossibleMoves(
                dragState.draggedPiece.piece,
                currentPlayerCards[dragState.draggedPiece.cardIndex],
                currentBoard
              );

              const isValidMove = possibleMoves.some(
                ([moveRow, moveCol]) =>
                  moveRow === targetRow && moveCol === targetCol
              );

              if (isValidMove && onPieceMove) {
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

  const handleCellClick = (row: number, col: number) => {
    // Don't trigger click if we're dragging
    if (dragState.isDragging) return;
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

    const selectedCard =
      gameState.players[gameState.currentPlayer].cards[cardIndex];
    return getPossibleMoves(piece, selectedCard, gameState.board);
  })();

  const renderPiece = (
    piece: Piece | null,
    isSelected: boolean = false,
    row?: number,
    col?: number
  ) => {
    if (!piece || row === undefined || col === undefined) return null;

    const canDrag =
      piece.player === gameState.currentPlayer && !gameState.winner;
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
      className="neoprene-mat scroll-texture p-0.5 sm:p-1 md:p-2 lg:p-4 border border-stone-300 shadow-2xl"
      onContextMenu={handleContextMenu}
    >
      <div className="grid grid-cols-5 gap-0.25 sm:gap-0.5 md:gap-1 lg:gap-1.5 bg-stone-100 p-0.5 sm:p-1 md:p-2 lg:p-3 border border-stone-200 shadow-inner ink-wash">
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
                onClick={() => handleCellClick(row, col)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleCellClick(row, col)
                }
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
              style={{
                position: "absolute",
                left: dragState.dragPosition.x,
                top: dragState.dragPosition.y,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
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
