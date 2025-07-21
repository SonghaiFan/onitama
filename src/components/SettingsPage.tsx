"use client";

import { motion } from "motion/react";
import { useGameStore } from "@/store/gameStore";

export default function SettingsPage() {
  const { settings, updateSettings, setCurrentScreen } = useGameStore();

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      updateSettings({ [key]: !settings[key] });
    }
  };

  const changeSetting = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full" />
        </motion.div>

        {/* Settings Panel */}
        <motion.div
          className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-8">
            {/* Audio Settings */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  🔊
                </span>
                Audio
              </h3>
              <div className="space-y-4 ml-11">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <span className="text-white font-medium">
                      Sound Effects
                    </span>
                    <p className="text-slate-400 text-sm">
                      Enable game sounds and effects
                    </p>
                  </div>
                  <motion.button
                    onClick={() => toggleSetting("soundEnabled")}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                      settings.soundEnabled
                        ? "bg-blue-500 justify-end"
                        : "bg-slate-600 justify-start"
                    } flex`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Visual Settings */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  ✨
                </span>
                Visual
              </h3>
              <div className="space-y-4 ml-11">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div>
                    <span className="text-white font-medium">Animations</span>
                    <p className="text-slate-400 text-sm">
                      Enable smooth animations and transitions
                    </p>
                  </div>
                  <motion.button
                    onClick={() => toggleSetting("animationsEnabled")}
                    className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
                      settings.animationsEnabled
                        ? "bg-purple-500 justify-end"
                        : "bg-slate-600 justify-start"
                    } flex`}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </motion.button>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="mb-3">
                    <span className="text-white font-medium">Theme</span>
                    <p className="text-slate-400 text-sm">
                      Choose your preferred visual theme
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["default", "zen", "neon"] as const).map((theme) => (
                      <motion.button
                        key={theme}
                        onClick={() => changeSetting("theme", theme)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 capitalize ${
                          settings.theme === theme
                            ? "border-purple-400 bg-purple-500/20 text-purple-300"
                            : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {theme}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gameplay Settings */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  ⚔️
                </span>
                Gameplay
              </h3>
              <div className="space-y-4 ml-11">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="mb-3">
                    <span className="text-white font-medium">
                      AI Difficulty
                    </span>
                    <p className="text-slate-400 text-sm">
                      Set the challenge level for AI opponents
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["easy", "medium", "hard"] as const).map((difficulty) => (
                      <motion.button
                        key={difficulty}
                        onClick={() => changeSetting("difficulty", difficulty)}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 capitalize ${
                          settings.difficulty === difficulty
                            ? "border-green-400 bg-green-500/20 text-green-300"
                            : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {difficulty}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-4 mt-8 pt-8 border-t border-slate-600/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={() => setCurrentScreen("landing")}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-700/50 to-slate-600/30 backdrop-blur-sm border border-slate-500/50 text-slate-200 rounded-xl font-semibold hover:border-slate-400/80 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Back to Menu
            </motion.button>

            <motion.button
              onClick={() => {
                // Reset to defaults
                updateSettings({
                  soundEnabled: true,
                  animationsEnabled: true,
                  theme: "default",
                  difficulty: "medium",
                });
              }}
              className="px-6 py-3 bg-gradient-to-r from-red-600/50 to-red-500/30 backdrop-blur-sm border border-red-500/50 text-red-200 rounded-xl font-semibold hover:border-red-400/80 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset Defaults
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
