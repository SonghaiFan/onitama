import React from "react";
import Image from "next/image";
import { content, Language } from "./content";
import { ZenButton } from "./shared";

interface LandingHeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onStartGame: () => void;
}

export function LandingHeader({
  language,
  onToggleLanguage,
  onStartGame,
}: LandingHeaderProps) {
  return (
    <>
      {/* Language Toggle */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <ZenButton
          onClick={onToggleLanguage}
          variant="secondary"
          className="px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
        >
          {language === "zh" ? "EN" : "中文"}
        </ZenButton>
      </div>

      {/* Header */}
      <header className="text-center py-8 sm:py-10 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center w-full">
              <Image
                src="/Onitama_Logo.svg.png"
                alt="Onitama"
                width={200}
                height={60}
                className="object-contain zen-float sm:w-[260px] sm:h-[78px]"
                priority
              />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl lg:text-4xl text-stone-600 mb-8 sm:mb-12 lg:mb-16 font-light tracking-wide leading-relaxed zen-text">
            <span className="text-base sm:text-lg text-stone-500">
              {content[language].title}
            </span>
          </p>
        </div>
      </header>
    </>
  );
}
