"use client";

import { motion, AnimatePresence } from "motion/react";
import { GameState } from "@/types/game";

interface GameStatusProps {
  gameState: GameState;
}

export default function GameStatus({ gameState }: GameStatusProps) {
  const currentPlayerName =
    gameState.currentPlayer === "player1"
      ? "青の戦士 (Blue Warrior)"
      : "赤の戦士 (Red Warrior)";
  const currentPlayerColor =
    gameState.currentPlayer === "player1" ? "text-blue-600" : "text-red-600";

  return (
    <motion.div
      className="zen-card rounded-2xl p-6 shadow-xl relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Traditional decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      {/* Header with Japanese typography */}
      <motion.div
        className="text-center mb-6"
        animate={{ color: gameState.winner ? "#059669" : "#92400e" }}
      >
        <h3
          className="text-2xl font-bold text-amber-800 mb-2"
          style={{ fontFamily: '"Noto Serif JP", serif' }}
        >
          戦況 • Game Status
        </h3>
        <div className="w-16 h-0.5 bg-gradient-to-r from-amber-600 to-amber-700 mx-auto rounded-full" />
      </motion.div>

      <AnimatePresence mode="wait">
        {gameState.winner ? (
          <motion.div
            className="text-center space-y-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Victory celebration */}
            <motion.div
              className="relative"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              <div className="text-5xl mb-2">🏆</div>
              <div
                className="text-3xl font-bold text-emerald-700 mb-2"
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                勝利！
              </div>
              <div className="text-lg font-semibold text-emerald-600">
                Victory!
              </div>
            </motion.div>

            <motion.div
              className={`text-xl font-bold ${
                gameState.winner === "player1"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {gameState.winner === "player1"
                ? "青の戦士の勝利"
                : "赤の戦士の勝利"}
            </motion.div>
            <div
              className={`text-lg ${
                gameState.winner === "player1"
                  ? "text-blue-500"
                  : "text-red-500"
              }`}
            >
              {gameState.winner === "player1"
                ? "Blue Warrior Wins!"
                : "Red Warrior Wins!"}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Current turn indicator */}
            <motion.div
              className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200/60"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-amber-700 font-medium"
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                >
                  現在の手番:
                </span>
                <motion.div
                  className={`font-bold ${currentPlayerColor} flex items-center space-x-2`}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      gameState.currentPlayer === "player1"
                        ? "bg-gradient-to-br from-blue-400 to-blue-600"
                        : "bg-gradient-to-br from-red-400 to-red-600"
                    } shadow-lg`}
                  />
                  <span style={{ fontFamily: '"Noto Sans JP", sans-serif' }}>
                    {currentPlayerName}
                  </span>
                </motion.div>
              </div>
            </motion.div>

            {/* Game phase */}
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/60"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-blue-700 font-medium"
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                >
                  進行状況:
                </span>
                <motion.span
                  className="font-semibold text-blue-800 capitalize"
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {gameState.gamePhase === "playing"
                    ? "対戦中"
                    : gameState.gamePhase}
                </motion.span>
              </div>
            </motion.div>

            {/* Selected piece indicator */}
            <AnimatePresence>
              {gameState.selectedPiece && (
                <motion.div
                  className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl p-4 border border-yellow-200/60"
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-yellow-700 font-medium"
                      style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                    >
                      選択された駒:
                    </span>
                    <motion.div
                      className="font-bold text-yellow-800 flex items-center space-x-2"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>
                        座標 ({gameState.selectedPiece.row},{" "}
                        {gameState.selectedPiece.col})
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win conditions with traditional styling */}
      <motion.div
        className="mt-8 pt-6 border-t border-amber-200/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.01 }}
      >
        <motion.div
          className="font-semibold mb-3 text-amber-800 text-center"
          style={{ fontFamily: '"Noto Serif JP", serif' }}
          animate={{ color: ["#92400e", "#b45309", "#92400e"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          勝利条件 • Victory Conditions
        </motion.div>
        <div className="space-y-3 text-sm">
          <motion.div
            className="flex items-center space-x-3 p-3 bg-red-50/50 rounded-lg border border-red-100/60"
            whileHover={{ x: 3, backgroundColor: "rgb(254, 242, 242)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-sm flex-shrink-0" />
            <div>
              <div
                className="font-semibold text-red-700"
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                石の道 • Way of Stone
              </div>
              <div className="text-red-600 text-xs">
                Capture opponent's Master piece
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100/60"
            whileHover={{ x: 3, backgroundColor: "rgb(239, 246, 255)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-sm flex-shrink-0" />
            <div>
              <div
                className="font-semibold text-blue-700"
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                流れの道 • Way of Stream
              </div>
              <div className="text-blue-600 text-xs">
                Move Master to opponent's Temple Arch
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
