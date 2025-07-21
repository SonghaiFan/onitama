"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import GameBoard from "@/components/GameBoard";
import MoveCards from "@/components/MoveCards";
import { GameState, Position } from "@/types/game";
import { useGameStore } from "@/store/gameStore";
import { getPossibleMoves, isValidMove, executeMove } from "@/utils/gameLogic";

// Animal kanji mapping for the shared card
const animalKanji = {
  Tiger: "虎",
  Dragon: "龍",
  Frog: "蛙",
  Rabbit: "兎",
  Crab: "蟹",
  Crane: "鶴",
  Elephant: "象",
  Mantis: "螳",
  Boar: "猪",
  Horse: "馬",
  Ox: "牛",
  Goose: "雁",
  Rooster: "鶏",
  Monkey: "猿",
  Eel: "鰻",
  Cobra: "蛇",
};

export default function OnitamaGame() {
  const { gameState, setGameState, resetGame } = useGameStore();
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);

  const handlePieceClick = useCallback(
    (position: Position) => {
      if (gameState.winner) return;

      const piece = gameState.board[position.row][position.col];

      // If clicking on empty space and we have a selected piece and card, try to move
      if (
        !piece &&
        gameState.selectedPiece &&
        gameState.selectedCard !== null
      ) {
        const selectedCard =
          gameState.players[gameState.currentPlayer].cards[
            gameState.selectedCard
          ];

        if (
          isValidMove(
            gameState.selectedPiece,
            position,
            selectedCard,
            gameState.board
          )
        ) {
          const newGameState = executeMove(
            gameState,
            gameState.selectedPiece,
            position,
            gameState.selectedCard
          );
          setGameState(newGameState);
          setPossibleMoves([]);
        }
        return;
      }

      // If clicking on a piece
      if (piece) {
        // If it's the current player's piece, select it
        if (piece.player === gameState.currentPlayer) {
          const newGameState = { ...gameState, selectedPiece: position };
          setGameState(newGameState);

          // Show possible moves if a card is also selected
          if (gameState.selectedCard !== null) {
            const selectedCard =
              gameState.players[gameState.currentPlayer].cards[
                gameState.selectedCard
              ];
            const moves = getPossibleMoves(
              piece,
              selectedCard,
              gameState.board
            );
            setPossibleMoves(moves);
          }
        }
        // If it's an opponent's piece and we can capture it
        else if (gameState.selectedPiece && gameState.selectedCard !== null) {
          const selectedCard =
            gameState.players[gameState.currentPlayer].cards[
              gameState.selectedCard
            ];

          if (
            isValidMove(
              gameState.selectedPiece,
              position,
              selectedCard,
              gameState.board
            )
          ) {
            const newGameState = executeMove(
              gameState,
              gameState.selectedPiece,
              position,
              gameState.selectedCard
            );
            setGameState(newGameState);
            setPossibleMoves([]);
          }
        }
      }
    },
    [gameState, setGameState]
  );

  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (gameState.winner) return;

      const newGameState = { ...gameState, selectedCard: cardIndex };
      setGameState(newGameState);

      // Show possible moves if a piece is also selected
      if (gameState.selectedPiece) {
        const piece =
          gameState.board[gameState.selectedPiece.row][
            gameState.selectedPiece.col
          ];
        if (piece) {
          const selectedCard =
            gameState.players[gameState.currentPlayer].cards[cardIndex];
          const moves = getPossibleMoves(piece, selectedCard, gameState.board);
          setPossibleMoves(moves);
        }
      }
    },
    [gameState, setGameState]
  );

  const handleResetGame = useCallback(() => {
    resetGame();
    setPossibleMoves([]);
  }, [resetGame]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center justify-center max-w-7xl mx-auto p-6 pt-20">
      {/* Left Side Panel - Enhanced Shared Card */}
      <motion.div
        className="flex flex-col items-center space-y-8"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Shared Card with Japanese aesthetics */}
        <motion.div
          className="zen-card rounded-2xl p-6 shadow-2xl relative overflow-hidden w-32 h-44"
          whileHover={{ scale: 1.05, rotateY: 8, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        >
          {/* Traditional border pattern */}
          <div className="absolute inset-2 border border-amber-200/60 rounded-xl">
            <div className="absolute inset-1 border border-amber-300/40 rounded-lg" />
          </div>

          <div className="relative z-10 h-full flex flex-col text-center">
            {/* Shared card label */}
            <div
              className="text-xs font-medium text-amber-700 mb-2 tracking-wide"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              共有カード • Shared
            </div>

            {/* Animal name in Japanese */}
            <div
              className="text-3xl font-bold text-amber-800 mb-1"
              style={{ fontFamily: '"Noto Serif JP", serif' }}
            >
              {animalKanji[
                gameState.sharedCard.name as keyof typeof animalKanji
              ] || gameState.sharedCard.name[0]}
            </div>

            <div
              className="text-xs text-amber-600 mb-4 tracking-wide"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              {gameState.sharedCard.name}
            </div>

            {/* Movement pattern */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100/80 to-amber-50 rounded-lg border border-amber-200/80 grid grid-cols-3 gap-1 p-2 shadow-inner">
                {gameState.sharedCard.pattern.map((row, i) =>
                  row.map((cell, j) => (
                    <motion.div
                      key={`${i}-${j}`}
                      className={`w-4 h-4 rounded-sm transition-all duration-300 ${
                        cell === "X"
                          ? "bg-gradient-to-br from-amber-600 to-amber-700 shadow-sm"
                          : cell === "O"
                          ? "bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-sm border border-yellow-700/20"
                          : "bg-amber-100/60 border border-amber-200/40"
                      }`}
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.4, delay: (i * 3 + j) * 0.05 }}
                      whileHover={{
                        scale: cell !== " " ? 1.1 : 1,
                        rotate: cell === "O" ? 180 : 0,
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
          </div>
        </motion.div>

        {/* Enhanced Current Player Indicator */}
        <motion.div
          className={`zen-card rounded-2xl px-6 py-4 shadow-lg border-2 relative overflow-hidden ${
            gameState.currentPlayer === "player1"
              ? "border-blue-300/50 bg-gradient-to-br from-blue-50 to-blue-100/50"
              : "border-red-300/50 bg-gradient-to-br from-red-50 to-red-100/50"
          }`}
          animate={{
            scale: [1, 1.02, 1],
            boxShadow:
              gameState.currentPlayer === "player1"
                ? [
                    "0 4px 20px rgba(59, 130, 246, 0.2)",
                    "0 8px 30px rgba(59, 130, 246, 0.4)",
                    "0 4px 20px rgba(59, 130, 246, 0.2)",
                  ]
                : [
                    "0 4px 20px rgba(239, 68, 68, 0.2)",
                    "0 8px 30px rgba(239, 68, 68, 0.4)",
                    "0 4px 20px rgba(239, 68, 68, 0.2)",
                  ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <div className="text-center space-y-2">
            <div
              className="text-xs opacity-80 font-medium"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              現在の手番 • Current Turn
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full shadow-lg ${
                  gameState.currentPlayer === "player1"
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : "bg-gradient-to-br from-red-400 to-red-600"
                }`}
              />
              <div
                className={`font-semibold ${
                  gameState.currentPlayer === "player1"
                    ? "text-blue-700"
                    : "text-red-700"
                }`}
                style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
              >
                {gameState.currentPlayer === "player1"
                  ? "青の戦士"
                  : "赤の戦士"}
              </div>
            </div>
            <div
              className={`text-xs ${
                gameState.currentPlayer === "player1"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {gameState.currentPlayer === "player1"
                ? "Blue Warrior"
                : "Red Warrior"}
            </div>
          </div>

          {/* Decorative element */}
          <div
            className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
              gameState.currentPlayer === "player1"
                ? "bg-gradient-to-r from-blue-400 to-blue-600"
                : "bg-gradient-to-r from-red-400 to-red-600"
            }`}
          />
        </motion.div>
      </motion.div>

      {/* Center Game Area */}
      <motion.div
        className="flex flex-col items-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Player 2 Cards (Top) */}
        <motion.div
          className="transform rotate-180"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <MoveCards
            cards={gameState.players.player2.cards}
            player="player2"
            onCardClick={handleCardClick}
            isCurrentPlayer={gameState.currentPlayer === "player2"}
            selectedCard={
              gameState.currentPlayer === "player2"
                ? gameState.selectedCard
                : null
            }
          />
        </motion.div>

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <GameBoard
            gameState={gameState}
            onPieceClick={handlePieceClick}
            possibleMoves={possibleMoves}
          />
        </motion.div>

        {/* Player 1 Cards (Bottom) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <MoveCards
            cards={gameState.players.player1.cards}
            player="player1"
            onCardClick={handleCardClick}
            isCurrentPlayer={gameState.currentPlayer === "player1"}
            selectedCard={
              gameState.currentPlayer === "player1"
                ? gameState.selectedCard
                : null
            }
          />
        </motion.div>
      </motion.div>

      {/* Right Side Panel - Enhanced Game Controls */}
      <motion.div
        className="flex flex-col items-center space-y-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.button
          onClick={handleResetGame}
          className="zen-card px-8 py-4 rounded-2xl font-semibold text-blue-700 hover:text-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/60 hover:border-blue-300/80 relative overflow-hidden"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span>🔄</span>
            <span>新しいゲーム • New Game</span>
          </span>

          {/* Hover effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-blue-600/15 opacity-0 hover:opacity-100 transition-opacity duration-300"
            whileHover={{ opacity: 1 }}
          />
        </motion.button>

        {/* Enhanced Legend */}
        <motion.div
          className="zen-card rounded-2xl p-6 shadow-lg space-y-4 border border-slate-200/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div
            className="text-lg font-semibold text-amber-800 text-center mb-4"
            style={{ fontFamily: '"Noto Serif JP", serif' }}
          >
            操作説明 • Controls
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full shadow-sm flex-shrink-0" />
              <span className="text-emerald-700 font-medium">
                有効な移動 • Valid moves
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-sm flex-shrink-0" />
              <span className="text-red-700 font-medium">
                捕獲可能 • Capture moves
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-sm flex-shrink-0" />
              <span className="text-yellow-700 font-medium">
                選択中 • Selected
              </span>
            </div>
          </div>
        </motion.div>

        {/* Traditional decorative element */}
        <motion.div
          className="w-16 h-16 opacity-30"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-600"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Enhanced Win Celebration Modal */}
      <AnimatePresence>
        {gameState.winner && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="zen-card rounded-3xl p-10 text-center max-w-md w-full shadow-2xl border-2 border-emerald-200/60 relative overflow-hidden"
              initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {/* Celebration background */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100/50" />

              {/* Victory content */}
              <div className="relative z-10">
                <motion.div
                  className="text-7xl mb-6"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.8, repeat: 3 }}
                >
                  🏆
                </motion.div>

                <motion.div
                  className="text-4xl font-bold text-emerald-700 mb-3"
                  style={{ fontFamily: '"Noto Serif JP", serif' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  勝利！
                </motion.div>

                <div className="text-2xl font-semibold text-emerald-600 mb-4">
                  Victory!
                </div>

                <motion.div
                  className={`text-xl font-bold mb-6 ${
                    gameState.winner === "player1"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {gameState.winner === "player1"
                    ? "青の戦士の勝利！"
                    : "赤の戦士の勝利！"}
                </motion.div>

                <div
                  className={`text-lg mb-8 ${
                    gameState.winner === "player1"
                      ? "text-blue-500"
                      : "text-red-500"
                  }`}
                >
                  {gameState.winner === "player1"
                    ? "Blue Warrior Wins!"
                    : "Red Warrior Wins!"}
                </div>

                <motion.button
                  onClick={handleResetGame}
                  className="zen-card px-8 py-4 rounded-2xl font-semibold text-emerald-700 hover:text-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/60 hover:border-emerald-300/80"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
                >
                  再挑戦 • Play Again
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
