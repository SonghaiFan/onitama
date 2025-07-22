"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GameState, Piece } from "@/types/game";
import { isTempleArch, getPossibleMoves } from "@/utils/gameLogic";
import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay as DndDragOverlay,
} from "@dnd-kit/core";
import { DraggablePiece, DroppableCell, DragOverlay } from "./GamePiece";

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

export default function GameBoard({
  gameState,
  onPieceClick,
  onCardSelect,
  onPieceMove,
}: GameBoardProps) {
  const [draggedPieceData, setDraggedPieceData] =
    useState<DraggedPieceData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [rightDragStart, setRightDragStart] = useState<{
    pieceId: string;
    position: [number, number];
    piece: Piece;
  } | null>(null);
  const [rightDragPosition, setRightDragPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Prevent context menu on the entire board
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Handle right-click drag start
  const handleRightMouseDown = useCallback(
    (e: React.MouseEvent, piece: Piece, position: [number, number]) => {
      if (e.button === 2) {
        // Right mouse button
        e.preventDefault();

        if (piece.player === gameState.currentPlayer && !gameState.winner) {
          // Right-click drag uses right card (index 1)
          const cardIndex = 1;

          // Update game state to select the card for consistent highlighting
          if (onCardSelect) {
            onCardSelect(cardIndex);
          }

          // Mock a drag event by setting the dragged piece data directly
          setDraggedPieceData({
            position,
            piece,
            cardIndex,
          });
          setIsDragging(true);
          setIsRightDragging(true);

          // Store the right drag start info for later use
          setRightDragStart({
            pieceId: piece.id,
            position,
            piece,
          });
        }
      }
    },
    [gameState]
  );

  // Handle mouse move for right-click drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isRightDragging && rightDragStart) {
        // Update the drag position for the overlay
        setRightDragPosition({ x: e.clientX, y: e.clientY });
      }
    },
    [isRightDragging, rightDragStart]
  );

  // Handle mouse up for right-click drag
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (isRightDragging && rightDragStart) {
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

              // Check if it's a valid move using the existing possibleMoves logic
              const possibleMoves = getPossibleMoves(
                rightDragStart.piece,
                gameState.players[gameState.currentPlayer].cards[1],
                gameState.board
              );

              const isValidMove = possibleMoves.some(
                ([moveRow, moveCol]) =>
                  moveRow === targetRow && moveCol === targetCol
              );

              if (isValidMove && onPieceMove) {
                onPieceMove(rightDragStart.position, [targetRow, targetCol], 1);
              }
            }
          }
        }

        // Reset right drag state
        setIsRightDragging(false);
        setRightDragStart(null);
        setRightDragPosition(null);
        setDraggedPieceData(null);
        setIsDragging(false);
      }
    },
    [isRightDragging, rightDragStart, gameState, onPieceMove]
  );

  // Set up global event listeners for right-click drag
  useEffect(() => {
    if (isRightDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isRightDragging, handleMouseMove, handleMouseUp]);

  // Configure sensors to handle left mouse button only
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after 5px movement
      },
    })
  );

  const handleCellClick = (row: number, col: number) => {
    // Don't trigger click if we're dragging
    if (isDragging) return;
    onPieceClick([row, col]);
  };

  // Calculate possible moves when both piece and card are selected OR when dragging
  const possibleMoves: [number, number][] = (() => {
    const piecePosition = draggedPieceData?.position || gameState.selectedPiece;
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

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const pieceId = active.id as string;

      // Find the piece by its unique ID
      let foundPiece: Piece | null = null;
      let foundPosition: [number, number] | null = null;

      // Search through the board to find the piece with this ID
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const piece = gameState.board[row][col];
          if (piece && piece.id === pieceId) {
            foundPiece = piece;
            foundPosition = [row, col];
            break;
          }
        }
        if (foundPiece) break;
      }

      if (!foundPiece || !foundPosition) {
        return;
      }

      if (foundPiece.player !== gameState.currentPlayer || gameState.winner) {
        return;
      }

      // Left-click drag uses left card (index 0)
      const cardIndex = 0;

      // Update game state to select the card for consistent highlighting
      if (onCardSelect) {
        onCardSelect(cardIndex);
      }

      setDraggedPieceData({
        position: foundPosition,
        piece: foundPiece,
        cardIndex,
      });
      setIsDragging(true);
    },
    [gameState]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!draggedPieceData || !over) {
        setDraggedPieceData(null);
        setIsDragging(false);
        return;
      }

      const targetId = over.id as string;

      // Check if dropping on a valid cell
      if (targetId.startsWith("cell-")) {
        const parts = targetId.split("-");
        if (parts.length !== 3 || parts[0] !== "cell") {
          return;
        }

        const targetRow = parseInt(parts[1]);
        const targetCol = parseInt(parts[2]);

        // Validate target position
        if (
          isNaN(targetRow) ||
          isNaN(targetCol) ||
          targetRow < 0 ||
          targetRow >= 5 ||
          targetCol < 0 ||
          targetCol >= 5
        ) {
          return;
        }

        const isValidDrop = possibleMoves.some(
          ([moveRow, moveCol]) => moveRow === targetRow && moveCol === targetCol
        );

        if (isValidDrop && onPieceMove) {
          onPieceMove(
            draggedPieceData.position,
            [targetRow, targetCol],
            draggedPieceData.cardIndex
          );
        }
      }

      setDraggedPieceData(null);
      setIsDragging(false);
    },
    [draggedPieceData, possibleMoves, onPieceMove]
  );

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
      isDragging &&
      draggedPieceData?.position[0] === row &&
      draggedPieceData?.position[1] === col;

    return (
      <DraggablePiece
        piece={piece}
        row={row}
        col={col}
        isSelected={isSelected}
        canDrag={canDrag}
        isDraggedPiece={isDraggedPiece}
        selectedCardIndex={gameState.selectedCard ?? undefined}
        onRightMouseDown={handleRightMouseDown}
      />
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="neoprene-mat scroll-texture p-8 border border-stone-300 shadow-2xl"
        onContextMenu={handleContextMenu}
      >
        <div className="grid grid-cols-5 gap-2 bg-stone-100 p-4 border border-stone-200 shadow-inner ink-wash">
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
                  isDragging={isDragging}
                  dragCardIndex={draggedPieceData?.cardIndex}
                  onClick={() => handleCellClick(row, col)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCellClick(row, col)
                  }
                >
                  <AnimatePresence mode="wait">
                    {(isBlueTempleArch || isRedTempleArch) && !piece && (
                      <motion.div
                        key={`temple-${row}-${col}-${
                          isBlueTempleArch ? "blue" : "red"
                        }`}
                        className="text-2xl text-stone-600 zen-float"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          opacity: { duration: 0.3 },
                          scale: { duration: 0.3 },
                        }}
                      >
                        ⛩
                      </motion.div>
                    )}

                    {piece && renderPiece(piece, isSelected, row, col)}

                    {/* Show possible move indicator */}
                    {/* Removed animated circle - colored cell background is sufficient */}
                  </AnimatePresence>
                </DroppableCell>
              );
            })
          )}
        </div>
      </div>

      <DndDragOverlay>
        {draggedPieceData && (
          <DragOverlay
            piece={draggedPieceData.piece}
            cardIndex={gameState.selectedCard ?? 0}
          />
        )}
      </DndDragOverlay>

      {/* Custom overlay for right-click drag */}
      {isRightDragging && rightDragStart && rightDragPosition && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: rightDragPosition.x,
              top: rightDragPosition.y,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <DragOverlay
              piece={rightDragStart.piece}
              cardIndex={gameState.selectedCard ?? 1}
            />
          </div>
        </div>
      )}
    </DndContext>
  );
}
