import React, { useState, useEffect } from "react";
import { content, Language } from "./content";
import { ZenButton } from "./shared";

type CardPack = "normal" | "senseis" | "windway" | "promo" | "dual";

interface CardPackSelectionProps {
  language: Language;
  selectedPacks: Set<CardPack>;
  onTogglePack: (pack: CardPack) => void;
  onStartGame: () => void;
}

// Function to check if selected packs have enough cards
async function checkCardAvailability(selectedPacks: Set<CardPack>): Promise<{
  hasEnoughCards: boolean;
  totalCards: number;
  warnings: string[];
}> {
  if (selectedPacks.size === 0) {
    return {
      hasEnoughCards: false,
      totalCards: 0,
      warnings: ["No card packs selected"],
    };
  }

  const allCards: any[] = [];
  const warnings: string[] = [];

  for (const packName of selectedPacks) {
    try {
      const response = await fetch(`/pack/onitama_16_cards_${packName}.json`);
      if (!response.ok) {
        warnings.push(
          `Failed to load ${packName} pack: HTTP ${response.status}`
        );
        continue;
      }
      const cardData = await response.json();
      if (cardData.cards && Array.isArray(cardData.cards)) {
        allCards.push(...cardData.cards);
      } else {
        warnings.push(`Invalid card data in ${packName} pack`);
      }
    } catch (error) {
      warnings.push(
        `Failed to load ${packName} pack: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  const totalCards = allCards.length;
  const hasEnoughCards = totalCards >= 5;

  if (!hasEnoughCards) {
    warnings.push(
      `Not enough cards available. Need 5 cards, but only ${totalCards} cards were loaded.`
    );
  }

  return { hasEnoughCards, totalCards, warnings };
}

function CardPackButton({
  pack,
  isSelected,
  onClick,
  lang,
  hasWarning,
}: {
  pack: CardPack;
  isSelected: boolean;
  onClick: () => void;
  lang: Language;
  hasWarning?: boolean;
}) {
  const packData = content[lang].cardPacks[pack];

  return (
    <div className="relative">
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

      {/* Warning badge */}
      {hasWarning && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-md border border-red-600">
          ⚠️
        </div>
      )}
    </div>
  );
}

export function CardPackSelection({
  language,
  selectedPacks,
  onTogglePack,
  onStartGame,
}: CardPackSelectionProps) {
  const [cardValidation, setCardValidation] = useState<{
    hasEnoughCards: boolean;
    totalCards: number;
    warnings: string[];
    isLoading: boolean;
  }>({
    hasEnoughCards: false,
    totalCards: 0,
    warnings: [],
    isLoading: false,
  });

  // Check card availability whenever selected packs change
  useEffect(() => {
    const validateCards = async () => {
      setCardValidation((prev) => ({ ...prev, isLoading: true }));

      const result = await checkCardAvailability(selectedPacks);

      setCardValidation({
        hasEnoughCards: result.hasEnoughCards,
        totalCards: result.totalCards,
        warnings: result.warnings,
        isLoading: false,
      });
    };

    validateCards();
  }, [selectedPacks]);

  // Get warning status for each pack
  const getPackWarningStatus = (pack: CardPack): boolean => {
    return cardValidation.warnings.some(
      (warning) =>
        warning.includes(pack) &&
        (warning.includes("Failed to load") ||
          warning.includes("Invalid card data"))
    );
  };

  return (
    <div className="text-center mb-8 sm:mb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h3 className="text-base sm:text-lg text-stone-700 mb-4 sm:mb-6 font-light tracking-wide zen-text">
          {content[language].cardPacks.title}
        </h3>

        {/* Card count indicator */}
        <div className="mb-4 sm:mb-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-50 border border-stone-200 shadow-sm">
            <span className="text-sm text-stone-600 font-light zen-text">
              {cardValidation.isLoading
                ? content[language].cardValidation.checking
                : `${content[language].cardValidation.availableCards}: ${cardValidation.totalCards}/5`}
            </span>
            {cardValidation.totalCards < 5 && !cardValidation.isLoading && (
              <span className="text-red-600 text-sm font-medium zen-text">
                {content[language].cardValidation.needMoreCards}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          <CardPackButton
            pack="normal"
            isSelected={selectedPacks.has("normal")}
            onClick={() => onTogglePack("normal")}
            lang={language}
            hasWarning={getPackWarningStatus("normal")}
          />
          <CardPackButton
            pack="senseis"
            isSelected={selectedPacks.has("senseis")}
            onClick={() => onTogglePack("senseis")}
            lang={language}
            hasWarning={getPackWarningStatus("senseis")}
          />
          <CardPackButton
            pack="promo"
            isSelected={selectedPacks.has("promo")}
            onClick={() => onTogglePack("promo")}
            lang={language}
            hasWarning={getPackWarningStatus("promo")}
          />
          {/* Pack with special */}
          <div className="w-full h-1 bg-stone-200 my-4 brush-stroke"></div>
          <CardPackButton
            pack="windway"
            isSelected={selectedPacks.has("windway")}
            onClick={() => onTogglePack("windway")}
            lang={language}
            hasWarning={getPackWarningStatus("windway")}
          />
          <CardPackButton
            pack="dual"
            isSelected={selectedPacks.has("dual")}
            onClick={() => onTogglePack("dual")}
            lang={language}
            hasWarning={getPackWarningStatus("dual")}
          />
        </div>

        <ZenButton
          onClick={onStartGame}
          disabled={!cardValidation.hasEnoughCards || cardValidation.isLoading}
          className="text-base sm:text-lg py-4 sm:py-6 px-8 sm:px-12 mt-8 sm:mt-12"
        >
          {cardValidation.isLoading
            ? content[language].cardValidation.checking
            : content[language].startGame}
        </ZenButton>
      </div>
    </div>
  );
}
