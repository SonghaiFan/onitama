"use client";

import { motion } from "motion/react";
import { useGameStore } from "@/store/gameStore";

export default function LandingPage() {
  const { setCurrentScreen, setGameMode } = useGameStore();

  const startGame = (mode: "classic" | "blitz" | "custom") => {
    setGameMode(mode);
    setCurrentScreen("game");
  };

  const openSettings = () => {
    setCurrentScreen("settings");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Enhanced animated background with zen aesthetics */}
      <div className="absolute inset-0 z-0">
        <div className="scroll-texture absolute inset-0" />
        <div className="watercolor-wash absolute inset-0" />

        {/* Floating traditional elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Traditional corner decorations */}
        <div className="absolute top-8 left-8 w-16 h-16 opacity-20">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-600"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute top-8 right-8 w-16 h-16 opacity-20 rotate-90">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-600"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute bottom-8 left-8 w-16 h-16 opacity-20 rotate-180">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-600"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="absolute bottom-8 right-8 w-16 h-16 opacity-20 -rotate-90">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-amber-600"
          >
            <path
              d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        {/* Enhanced logo with Japanese aesthetics */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, type: "spring", stiffness: 100 }}
        >
          <div className="mb-8">
            {/* Japanese title */}
            <motion.div
              className="text-6xl md:text-7xl font-bold mb-4"
              style={{
                fontFamily: '"Noto Serif JP", serif',
                background:
                  "linear-gradient(135deg, #92400e 0%, #b45309 25%, #d97706 50%, #b45309 75%, #92400e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              鬼魂
            </motion.div>

            {/* English title */}
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
              ONITAMA
            </h1>
          </div>

          <motion.div
            className="w-32 h-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 mx-auto rounded-full mb-8 relative"
            animate={{ scaleX: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
          </motion.div>
        </motion.div>

        {/* Subtitle with Japanese aesthetics */}
        <motion.div
          className="space-y-4 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <p
            className="text-2xl md:text-3xl text-amber-700 font-medium"
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            風と流れの道 • The Way of Wind and Stream
          </p>
          <p className="text-lg text-amber-600/90 max-w-3xl mx-auto leading-relaxed">
            Ancient wisdom meets modern strategy. Master the art of movement
            through the teachings of the five animal spirits on a sacred
            neoprene mat, reminiscent of traditional Japanese scrolls.
          </p>
        </motion.div>

        {/* Enhanced game mode selection with premium aesthetics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          {/* Classic Mode */}
          <motion.button
            onClick={() => startGame("classic")}
            className="group zen-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border-2 border-blue-200/30 hover:border-blue-300/60"
            whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="text-5xl mb-6">⚔️</div>
            <h3
              className="text-2xl font-bold text-blue-700 mb-4"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              伝統 • Classic
            </h3>
            <p className="text-blue-600/80 text-sm leading-relaxed mb-6">
              Traditional Onitama with authentic rules, premium quality pieces,
              and the complete 16-card movement deck
            </p>
            <div className="text-xs text-blue-500/60 space-y-1">
              <div>• 完全なカードデッキ (Full card deck)</div>
              <div>• 伝統的なルール (Classical rules)</div>
            </div>
          </motion.button>

          {/* Blitz Mode */}
          <motion.button
            onClick={() => startGame("blitz")}
            className="group zen-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border-2 border-red-200/30 hover:border-red-300/60"
            whileHover={{ scale: 1.05, y: -8, rotateY: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="text-5xl mb-6">⚡</div>
            <h3
              className="text-2xl font-bold text-red-700 mb-4"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              電光石火 • Blitz
            </h3>
            <p className="text-red-600/80 text-sm leading-relaxed mb-6">
              Fast-paced matches with timer pressure, quick decisions, and
              intense strategic gameplay
            </p>
            <div className="text-xs text-red-500/60 space-y-1">
              <div>• 5分間の対戦 (5-minute matches)</div>
              <div>• 迅速な判断 (Quick decisions)</div>
            </div>
          </motion.button>

          {/* Custom Mode */}
          <motion.button
            onClick={() => startGame("custom")}
            className="group zen-card rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 border-2 border-purple-200/30 hover:border-purple-300/60"
            whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="text-5xl mb-6">🎨</div>
            <h3
              className="text-2xl font-bold text-purple-700 mb-4"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              自由形 • Custom
            </h3>
            <p className="text-purple-600/80 text-sm leading-relaxed mb-6">
              Create your own rules, design custom card combinations, and
              explore new strategic possibilities
            </p>
            <div className="text-xs text-purple-500/60 space-y-1">
              <div>• カスタムカード (Custom cards)</div>
              <div>• 家庭内ルール (House rules)</div>
            </div>
          </motion.button>
        </motion.div>

        {/* Enhanced action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <motion.button
            onClick={openSettings}
            className="zen-card px-10 py-4 rounded-2xl font-semibold text-amber-700 hover:text-amber-800 transition-all duration-300 border border-amber-200/60 hover:border-amber-300/80"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            ⚙️ 設定 • Settings
          </motion.button>

          <motion.button
            onClick={() => setCurrentScreen("gameSelect")}
            className="zen-card px-10 py-4 rounded-2xl font-semibold text-indigo-700 hover:text-indigo-800 transition-all duration-300 border border-indigo-200/60 hover:border-indigo-300/80"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            📚 学習 • Learn to Play
          </motion.button>
        </motion.div>

        {/* Enhanced version info with zen aesthetics */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent mx-auto mb-4" />
          <p
            className="text-amber-600/60 text-sm"
            style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
          >
            鬼魂デジタル版 v1.0 • Onitama Digital Edition v1.0
          </p>
          <p className="text-amber-500/50 text-xs">
            Built with Next.js, Motion & Traditional Japanese Aesthetics
          </p>
        </motion.div>
      </div>
    </div>
  );
}
