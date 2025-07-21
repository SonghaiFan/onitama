"use client";

import { GameState } from "@/types/game";

interface GameStatusProps {
  gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
  const currentPlayerName =
    gameState.currentPlayer === "red" ? "紅方" : "蓝方";
  const currentPlayerColor =
    gameState.currentPlayer === "red" ? "text-red-800" : "text-blue-800";

  return (
    <div className="zen-card p-6 border border-stone-300">
      <div className="text-center mb-6">
        <h3 className="text-xl font-light text-stone-800 mb-2 tracking-wide">局勢</h3>
        <div className="w-12 h-px bg-stone-300 mx-auto"></div>
      </div>

      {gameState.winner ? (
        <div className="text-center space-y-4">
          <div className="text-3xl font-light text-stone-800 mb-4">
            局結
          </div>
          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-2xl text-amber-700">勝</span>
          </div>
          <div
            className={`text-xl font-medium ${
              gameState.winner === "red" ? "text-red-800" : "text-blue-800"
            }`}
          >
            {gameState.winner === "red" ? "紅方" : "蓝方"} 勝利！
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-stone-600 font-light mb-2">當前回合:</div>
            <div className="flex items-center justify-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                gameState.currentPlayer === "red" ? "bg-red-800" : "bg-blue-800"
              }`}></div>
              <span className={`font-medium text-lg ${currentPlayerColor}`}>
                {currentPlayerName}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-stone-600 font-light mb-2">階段:</div>
            <span className="font-medium text-stone-800 text-lg capitalize">
              {gameState.gamePhase === 'selectCard' ? '選牌' : 
               gameState.gamePhase === 'selectPiece' ? '選子' : 
               gameState.gamePhase === 'selectMove' ? '移動' : gameState.gamePhase}
            </span>
          </div>

          {gameState.selectedPiece && (
            <div className="text-center">
              <div className="text-stone-600 font-light mb-2">已選棋子:</div>
              <span className="font-medium text-stone-800">
                ({gameState.selectedPiece[0]}, {gameState.selectedPiece[1]})
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-stone-50 border border-stone-200 text-sm">
        <div className="text-center mb-3">
          <div className="font-medium text-stone-800 mb-2">勝利之道:</div>
          <div className="w-8 h-px bg-stone-300 mx-auto"></div>
        </div>
        <div className="space-y-2 text-stone-600 font-light">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-4 h-4 bg-stone-200 rounded-full flex items-center justify-center text-xs">石</span>
            <span>石之道: 擒獲對手師傅</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-4 h-4 bg-stone-200 rounded-full flex items-center justify-center text-xs">流</span>
            <span>流之道: 師傅抵達敵方神殿</span>
          </div>
        </div>
      </div>
    </div>
  );
}
