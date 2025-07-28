import React, { useState, useRef } from "react";
import Image from "next/image";
import { content, Language } from "../landing/content";
import { ZenButton } from "./ZenButton";
import { motion } from "motion/react";
interface UnifiedHeaderProps {
  language: Language;
  mode: "landing" | "game";
  onToggleLanguage?: () => void;
  onStartGame?: () => void;
  onBackToHome?: () => void;
  onNewGame?: () => void;
}

export function UnifiedHeader({
  language,
  mode,
  onToggleLanguage,
  onStartGame,
  onBackToHome,
  onNewGame,
}: UnifiedHeaderProps) {
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

  return (
    <header
      className={`relative z-10 ${
        mode === "landing"
          ? "bg-transparent"
          : "flex-shrink-0 border-b border-stone-200 bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto max-w-7xl">
        {mode === "landing" ? (
          <div className="pt-2 pr-2 sm:pt-4 sm:pr-4">
            <div className="flex justify-end mb-4">
              <ZenButton
                onClick={onToggleLanguage || (() => {})}
                variant="secondary"
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
              >
                {language === "zh" ? "EN" : "中文"}
              </ZenButton>
            </div>
            <div className="text-center py-8 sm:py-10 lg:py-16">
              <motion.div
                layout
                layoutId="logo"
                className="flex justify-center mb-6 sm:mb-8"
              >
                <Image
                  src="/Onitama_Logo.svg.png"
                  alt="Onitama"
                  width={400}
                  height={120}
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
                <ZenButton
                  onClick={onStartGame || (() => {})}
                  className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12"
                >
                  {content[language].startGame}
                </ZenButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 sm:gap-4 py-2">
            <div className="flex items-center">
              <ZenButton
                onClick={onBackToHome || (() => {})}
                variant="secondary"
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm mr-2 sm:mr-4"
              >
                {content[language].backToHome}
              </ZenButton>
            </div>
            <motion.div layout layoutId="logo" className="flex items-center">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={120}
                height={36}
                className="object-contain"
              />
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-4">
              <ZenButton
                onClick={toggleMusic}
                variant="secondary"
                className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm flex items-center gap-1 ${
                  isPlaying ? "" : "line-through"
                }`}
              >
                <span className="hidden sm:inline">
                  {content[language].music}
                </span>
              </ZenButton>
              <ZenButton
                onClick={onNewGame || (() => {})}
                variant="secondary"
                className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
              >
                {content[language].newGame}
              </ZenButton>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
