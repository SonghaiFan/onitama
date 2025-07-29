import React, { useState, useRef } from "react";
import Image from "next/image";
import { content, Language } from "../utils/content";
import { ZenButton } from "@/components/ui/ZenButton";
import { AIDropdown } from "@/components/AIDropdown";
import { motion, LayoutGroup, AnimatePresence } from "motion/react";
import { AIAlgorithm } from "@/utils/ai/aiFactory";
import { CardPack } from "@/types/game";

// Grouped AI settings interface
interface AISettings {
  enabled: boolean;
  algorithm?: AIAlgorithm;
  selectedPacks?: Set<CardPack>;
}

// Base header props
interface BaseHeaderProps {
  language: Language;
  onToggleLanguage?: () => void;
}

// Landing header specific props
interface LandingHeaderProps extends BaseHeaderProps {
  onStartGame?: () => void;
}

// Game header specific props
interface GameHeaderProps extends BaseHeaderProps {
  onBackToHome?: () => void;
  onNewGame?: () => void;
  aiSettings?: AISettings;
  onAISettingsChange?: (settings: Partial<AISettings>) => void;
}

// Main header props
interface HeaderProps {
  language: Language;
  mode: "landing" | "game";
  onToggleLanguage?: () => void;
  onStartGame?: () => void;
  onBackToHome?: () => void;
  onNewGame?: () => void;
  // AI Settings props (only for game mode)
  aiEnabled?: boolean;
  onSetAIEnabled?: (enabled: boolean) => void;
  aiAlgorithm?: AIAlgorithm;
  onAlgorithmChange?: (algorithm: AIAlgorithm) => void;
  selectedPacks?: Set<CardPack>;
}

// Landing Header Component
function LandingHeader({
  language,
  onToggleLanguage,
  onStartGame,
}: LandingHeaderProps) {
  return (
    <div className="pt-2 pr-2 sm:pt-4 sm:pr-4">
      <div className="flex justify-end mb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ZenButton
            onClick={onToggleLanguage || (() => {})}
            variant="secondary"
            className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            {language === "zh" ? "EN" : "中文"}
          </ZenButton>
        </motion.div>
      </div>
      <div className="text-center py-8 sm:py-10 lg:py-16">
        <motion.div
          layout
          layoutId="logo"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="flex justify-center mb-6 sm:mb-8"
        >
          <Image
            src="/Onitama_Logo.svg.png"
            alt="Onitama"
            width={400}
            height={120}
            style={{ width: "auto", height: "auto" }}
            className="object-contain zen-float sm:w-[520px] sm:h-[156px]"
            priority
          />
        </motion.div>
        <p className="text-2xl sm:text-3xl lg:text-4xl text-stone-600 mb-8 sm:mb-12 lg:mb-16 font-light tracking-wide leading-relaxed zen-text">
          <span className="text-base sm:text-lg text-stone-500">
            {content[language].title}
          </span>
        </p>
        <div className="flex justify-center pb-8 sm:pb-10 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ZenButton
              onClick={onStartGame || (() => {})}
              className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12"
            >
              {content[language].startGame}
            </ZenButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Game Header Component
function GameHeader({
  language,
  onToggleLanguage,
  onBackToHome,
  onNewGame,
  aiSettings,
  onAISettingsChange,
}: GameHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/music/background-music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.1;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleAISettingsChange = (updates: Partial<AISettings>) => {
    if (onAISettingsChange) {
      onAISettingsChange(updates);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 p-2 sm:p-4">
      <div className="flex items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ZenButton
            onClick={onBackToHome || (() => {})}
            variant="secondary"
            className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm mr-2 sm:mr-4"
          >
            <span className="hidden sm:inline">
              {content[language].backToHome}
            </span>
            <span className="sm:hidden">←</span>
          </ZenButton>
        </motion.div>
      </div>
      <motion.div
        layout
        layoutId="logo"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.4,
        }}
        className="flex items-center"
      >
        <Image
          src="/Onitama_Logo.svg.png"
          alt="Onitama"
          width={120}
          height={20}
          style={{ width: "auto", height: "auto" }}
          className="object-contain"
        />
      </motion.div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* AI Settings Dropdown - only show when AI props are provided */}
        {aiSettings && onAISettingsChange && (
          <AIDropdown
            language={language}
            aiEnabled={aiSettings.enabled}
            onSetAIEnabled={(enabled) => handleAISettingsChange({ enabled })}
            aiAlgorithm={aiSettings.algorithm}
            onAlgorithmChange={(algorithm) =>
              handleAISettingsChange({ algorithm })
            }
            selectedPacks={aiSettings.selectedPacks}
          />
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ZenButton
            onClick={toggleMusic}
            variant="secondary"
            className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm flex items-center gap-1 ${
              isPlaying ? "" : "line-through"
            }`}
          >
            <span className="hidden sm:inline">{content[language].music}</span>
            <span className="sm:hidden">♪</span>
          </ZenButton>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <ZenButton
            onClick={onNewGame || (() => {})}
            variant="secondary"
            className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            <span className="hidden sm:inline">
              {content[language].newGame}
            </span>
            <span className="sm:hidden">新</span>
          </ZenButton>
        </motion.div>
      </div>
    </div>
  );
}

// Main Header Component (now acts as a coordinator)
export function Header({
  language,
  mode,
  onToggleLanguage,
  onStartGame,
  onBackToHome,
  onNewGame,
  aiEnabled,
  onSetAIEnabled,
  aiAlgorithm,
  onAlgorithmChange,
  selectedPacks,
}: HeaderProps) {
  // Transform legacy props to new grouped format
  const aiSettings: AISettings | undefined =
    aiEnabled !== undefined
      ? {
          enabled: aiEnabled,
          algorithm: aiAlgorithm,
          selectedPacks,
        }
      : undefined;

  const handleAISettingsChange = (updates: Partial<AISettings>) => {
    if (updates.enabled !== undefined && onSetAIEnabled) {
      onSetAIEnabled(updates.enabled);
    }
    if (updates.algorithm !== undefined && onAlgorithmChange) {
      onAlgorithmChange(updates.algorithm);
    }
  };

  return (
    <header
      className={`relative z-[9998] ${
        mode === "landing"
          ? "bg-transparent"
          : "flex-shrink-0 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <LayoutGroup>
        <div className="container mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            {mode === "landing" ? (
              <LandingHeader
                key="landing"
                language={language}
                onToggleLanguage={onToggleLanguage}
                onStartGame={onStartGame}
              />
            ) : (
              <GameHeader
                key="game"
                language={language}
                onToggleLanguage={onToggleLanguage}
                onBackToHome={onBackToHome}
                onNewGame={onNewGame}
                aiSettings={aiSettings}
                onAISettingsChange={handleAISettingsChange}
              />
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </header>
  );
}
