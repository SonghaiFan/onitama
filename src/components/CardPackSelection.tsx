import React, { useState, useEffect } from "react";
import { content, Language } from "@/utils/content";
import { checkAllPacks, checkCardAvailability } from "@/utils/dataLoader";
import { getPlayerColors } from "@/utils/gameAestheticConfig";
import { SelectionGroup } from "./ui/SelectionGroup";
import { CardPack } from "@/types/game";
import {
  SelectableItem,
  SelectionGroupConfig,
  SelectionState,
} from "@/types/ui";

interface CardPackSelectionProps {
  language: Language;
  selectedPacks: Set<CardPack>;
  onTogglePack: (pack: CardPack) => void;
}

export function CardPackSelection({
  language,
  selectedPacks,
  onTogglePack,
}: CardPackSelectionProps) {
  const [cardValidation, setCardValidation] = useState<{
    hasEnoughCards: boolean;
    totalCards: number;
    isLoading: boolean;
  }>({
    hasEnoughCards: false,
    totalCards: 0,
    isLoading: false,
  });

  const [availablePacks, setAvailablePacks] = useState<Set<CardPack>>(
    new Set()
  );

  // Check all available packs on component mount
  useEffect(() => {
    const checkPacks = async () => {
      const packs = await checkAllPacks();
      setAvailablePacks(packs);
    };
    checkPacks();
  }, []);

  // Check card availability whenever selected packs change
  useEffect(() => {
    const validateCards = async () => {
      setCardValidation((prev) => ({ ...prev, isLoading: true }));

      const result = await checkCardAvailability(selectedPacks);

      setCardValidation({
        hasEnoughCards: result.hasEnoughCards,
        totalCards: result.totalCards,
        isLoading: false,
      });
    };

    validateCards();
  }, [selectedPacks]);

  // Helper functions for new UI architecture
  const getPackItems = (packs: string[]): SelectableItem<CardPack>[] => {
    return packs
      .filter((pack) => availablePacks.has(pack as CardPack))
      .map((pack) => {
        const packData = content[language].cardPacks[pack as CardPack];
        return {
          id: pack as CardPack,
          label: packData.name,
          description: packData.description,
        };
      });
  };

  const getStandardPacksConfig = (): SelectionGroupConfig<CardPack> => ({
    id: "standard-packs",
    title: undefined, // Title is handled by parent component
    allowMultiple: true,
    layout: "grid",
    columns: 2,
  });

  const getSpecialPacksConfig = (): SelectionGroupConfig<CardPack> => ({
    id: "special-packs",
    title: undefined,
    allowMultiple: true,
    layout: "grid",
    columns: 1,
  });

  const getPackSelection = (): SelectionState<CardPack> => ({
    selected: selectedPacks,
    onChange: (newSelected) => {
      // Handle selection changes
      const currentPacks = Array.from(selectedPacks);
      const newPacks = Array.from(newSelected);

      // Find what changed
      const added = newPacks.find((pack) => !currentPacks.includes(pack));
      const removed = currentPacks.find((pack) => !newPacks.includes(pack));

      if (added) {
        onTogglePack(added);
      } else if (removed) {
        onTogglePack(removed);
      }
    },
  });

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
              <span
                className={`${
                  getPlayerColors("red").tailwind.text
                } text-sm font-medium zen-text`}
              >
                {content[language].cardValidation.needMoreCards}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Standard Packs */}
          <SelectionGroup
            items={getPackItems(["normal", "senseis", "promo", "special"])}
            config={getStandardPacksConfig()}
            selection={getPackSelection()}
            className="max-w-2xl mx-auto"
          />

          {/* Special Packs */}
          {getPackItems(["windway", "dual"]).length > 0 && (
            <>
              <div className="w-full h-1 bg-stone-200 my-4 brush-stroke"></div>
              <SelectionGroup
                items={getPackItems(["windway", "dual"])}
                config={getSpecialPacksConfig()}
                selection={getPackSelection()}
                className="max-w-2xl mx-auto"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
