"use client";

import { GameState } from "@/types/game";

interface GameStatusProps {
  gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
  const currentPlayerName =
    gameState.currentPlayer === "red" ? "Red Player" : "Blue Player";
  const currentPlayerColor =
    gameState.currentPlayer === "red" ? "text-red-600" : "text-blue-600";

  return (
    <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Game Status</h3>

      {gameState.winner ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            Game Over!
          </div>
          <div
            className={`text-xl font-semibold ${
              gameState.winner === "red" ? "text-red-600" : "text-blue-600"
            }`}
          >
            {gameState.winner === "red" ? "Red Player" : "Blue Player"} Wins!
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current Turn:</span>
            <span className={`font-semibold ${currentPlayerColor}`}>
              {currentPlayerName}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Phase:</span>
            <span className="font-semibold text-gray-800 capitalize">
              {gameState.gamePhase}
            </span>
          </div>

          {gameState.selectedPiece && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Selected Piece:</span>
              <span className="font-semibold text-gray-800">
                ({gameState.selectedPiece[0]}, {gameState.selectedPiece[1]})
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <div className="font-semibold mb-1">Win Conditions:</div>
        <div>• Way of Stone: Capture opponent's Master</div>
        <div>• Way of Stream: Move Master to opponent's Temple Arch</div>
      </div>
    </div>
  );
}
