"use client";

import { motion, AnimatePresence } from "motion/react";
import { useGameStore } from "@/store/gameStore";
import GameStatus from "./GameStatus";

export default function GameMenu() {
  const {
    isMenuOpen,
    toggleMenu,
    showInstructions,
    toggleInstructions,
    showGameStatus,
    toggleGameStatus,
    setCurrentScreen,
    resetGame,
    gameState,
    settings,
  } = useGameStore();

  const handleQuitGame = () => {
    resetGame();
    setCurrentScreen("landing");
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <motion.button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-br from-slate-800/90 to-slate-700/70 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white hover:border-slate-500/80 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isMenuOpen ? 90 : 0 }}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <div
            className={`w-4 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <div
            className={`w-4 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-4 h-0.5 bg-white transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </div>
      </motion.button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-slate-900/95 to-slate-800/90 backdrop-blur-sm border-r border-slate-600/50 z-40 overflow-y-auto"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6 pt-20">
              {/* Menu Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Game Menu
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </motion.div>

              {/* Menu Items */}
              <div className="space-y-4">
                {/* Game Status Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={toggleGameStatus}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        📊
                      </div>
                      <span className="text-white font-medium">
                        Game Status
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: showGameStatus ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showGameStatus && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2"
                      >
                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20">
                          <GameStatus gameState={gameState} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Instructions Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={toggleInstructions}
                    className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300 border border-slate-600/30"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        📖
                      </div>
                      <span className="text-white font-medium">
                        How to Play
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: showInstructions ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      ▼
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showInstructions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2"
                      >
                        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-600/20 text-slate-300 text-sm space-y-3">
                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              Basic Rules:
                            </h4>
                            <ul className="space-y-1 text-slate-300">
                              <li>• Select one of your move cards</li>
                              <li>• Click your piece to select it</li>
                              <li>• Click a highlighted square to move</li>
                              <li>• Cards rotate between players after use</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              Win Conditions:
                            </h4>
                            <ul className="space-y-1 text-slate-300">
                              <li>
                                •{" "}
                                <span className="text-red-400">
                                  Way of Stone:
                                </span>{" "}
                                Capture opponent's Master
                              </li>
                              <li>
                                •{" "}
                                <span className="text-blue-400">
                                  Way of Stream:
                                </span>{" "}
                                Move Master to Temple Arch
                              </li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-semibold text-white mb-2">
                              Visual Guide:
                            </h4>
                            <div className="flex items-center space-x-2 text-xs">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                              <span>Valid moves</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs mt-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span>Capture moves</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  className="space-y-3 pt-4 border-t border-slate-600/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={resetGame}
                    className="w-full p-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-300"
                  >
                    🔄 New Game
                  </button>

                  <button
                    onClick={() => setCurrentScreen("settings")}
                    className="w-full p-3 bg-slate-600/80 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-300"
                  >
                    ⚙️ Settings
                  </button>

                  <button
                    onClick={handleQuitGame}
                    className="w-full p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-xl font-medium transition-all duration-300"
                  >
                    🏠 Main Menu
                  </button>
                </motion.div>

                {/* Current Settings Display */}
                <motion.div
                  className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-600/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h4 className="text-white font-semibold mb-2 text-sm">
                    Current Settings
                  </h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Sound:</span>
                      <span
                        className={
                          settings.soundEnabled
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {settings.soundEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Animations:</span>
                      <span
                        className={
                          settings.animationsEnabled
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {settings.animationsEnabled ? "On" : "Off"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Theme:</span>
                      <span className="text-blue-400 capitalize">
                        {settings.theme}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}
