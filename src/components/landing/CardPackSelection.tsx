import React from "react";
import { content, Language } from "./content";
import { ZenButton } from "./shared";

type CardPack = "normal" | "senseis" | "windway" | "promo" | "dual";

interface CardPackSelectionProps {
  language: Language;
  selectedPacks: Set<CardPack>;
  onTogglePack: (pack: CardPack) => void;
  onStartGame: () => void;
}

function CardPackButton({
  pack,
  isSelected,
  onClick,
  lang,
}: {
  pack: CardPack;
  isSelected: boolean;
  onClick: () => void;
  lang: Language;
}) {
  const packData = content[lang].cardPacks[pack];

  return (
    <button
      onClick={onClick}
      className={`relative zen-card border-2 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 sm:hover:-translate-y-2 tracking-wide font-light zen-text focus:focus-zen overflow-hidden ${
        isSelected
          ? "border-stone-600 text-stone-800 bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg scale-105"
          : "border-stone-300 text-stone-600 hover:border-stone-500 hover:bg-stone-50"
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[16px] sm:border-l-[20px] border-l-transparent border-t-[16px] sm:border-t-[20px] border-t-stone-600"></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"></div>
      <div className="text-center relative z-10">
        <div className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
          {packData.name}
        </div>
        <div className="text-xs sm:text-sm text-stone-500 mb-2 sm:mb-3">
          {packData.description}
        </div>
        <div className="text-xs text-stone-400">
          {isSelected ? packData.selected : packData.unselected}
        </div>
      </div>
    </button>
  );
}

export function CardPackSelection({
  language,
  selectedPacks,
  onTogglePack,
  onStartGame,
}: CardPackSelectionProps) {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h3 className="text-base sm:text-lg text-stone-700 mb-4 sm:mb-6 font-light tracking-wide zen-text">
          {content[language].cardPacks.title}
        </h3>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          <CardPackButton
            pack="normal"
            isSelected={selectedPacks.has("normal")}
            onClick={() => onTogglePack("normal")}
            lang={language}
          />
          <CardPackButton
            pack="senseis"
            isSelected={selectedPacks.has("senseis")}
            onClick={() => onTogglePack("senseis")}
            lang={language}
          />
          <CardPackButton
            pack="promo"
            isSelected={selectedPacks.has("promo")}
            onClick={() => onTogglePack("promo")}
            lang={language}
          />
          {/* Pack with special */}
          <div className="w-full h-1 bg-stone-200 my-4 brush-stroke"></div>
          <CardPackButton
            pack="windway"
            isSelected={selectedPacks.has("windway")}
            onClick={() => onTogglePack("windway")}
            lang={language}
          />
          <CardPackButton
            pack="dual"
            isSelected={selectedPacks.has("dual")}
            onClick={() => onTogglePack("dual")}
            lang={language}
          />
        </div>

        <ZenButton
          onClick={onStartGame}
          className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12 mt-8 sm:mt-12"
        >
          {content[language].startGame}
        </ZenButton>
      </div>
    </div>
  );
}
