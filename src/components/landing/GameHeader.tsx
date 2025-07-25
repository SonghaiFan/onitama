import React from "react";
import Image from "next/image";
import { content, Language } from "./content";
import { ZenButton } from "./shared";

interface GameHeaderProps {
  language: Language;
  onBackToHome: () => void;
  onNewGame: () => void;
}

export function GameHeader({
  language,
  onBackToHome,
  onNewGame,
}: GameHeaderProps) {
  return (
    <div className="flex-shrink-0 p-2 sm:p-4 lg:p-6 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center">
            <ZenButton
              onClick={onBackToHome}
              variant="secondary"
              className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm mr-2 sm:mr-4"
            >
              {content[language].backToHome}
            </ZenButton>
          </div>
          <div className="flex items-center">
            <Image
              src="/Onitama_Logo.svg.png"
              alt="Onitama"
              width={120}
              height={36}
              className="object-contain zen-float sm:w-[160px] sm:h-[48px] lg:w-[200px] lg:h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ZenButton
              onClick={onNewGame}
              variant="secondary"
              className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
            >
              {content[language].newGame}
            </ZenButton>
          </div>
        </div>
      </div>
    </div>
  );
}
