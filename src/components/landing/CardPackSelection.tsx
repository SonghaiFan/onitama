import React, { useState, useEffect } from "react";
import { content, Language } from "./content";
import { SelectionGrid, SelectionOption } from "../ui/SelectionGrid";
import { checkAllPacks, checkCardAvailability } from "@/utils/dataLoader";

export type CardPack =
  | "normal"
  | "senseis"
  | "windway"
  | "promo"
  | "dual"
  | "special";

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
    warnings: string[];
    isLoading: boolean;
  }>({
    hasEnoughCards: false,
    totalCards: 0,
    warnings: [],
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
        warnings: result.warnings,
        isLoading: false,
      });
    };

    validateCards();
  }, [selectedPacks]);

  // Convert card packs to selection options
  const selectionOptions: SelectionOption<CardPack>[] = [
    {
      id: "normal",
      name: content[language].cardPacks.normal.name,
      description: content[language].cardPacks.normal.description,
      selectedText: content[language].cardPacks.normal.selected,
      unselectedText: content[language].cardPacks.normal.unselected,
      available: availablePacks.has("normal"),
    },
    {
      id: "senseis",
      name: content[language].cardPacks.senseis.name,
      description: content[language].cardPacks.senseis.description,
      selectedText: content[language].cardPacks.senseis.selected,
      unselectedText: content[language].cardPacks.senseis.unselected,
      available: availablePacks.has("senseis"),
    },
    {
      id: "promo",
      name: content[language].cardPacks.promo.name,
      description: content[language].cardPacks.promo.description,
      selectedText: content[language].cardPacks.promo.selected,
      unselectedText: content[language].cardPacks.promo.unselected,
      available: availablePacks.has("promo"),
    },
    {
      id: "special",
      name: content[language].cardPacks.special.name,
      description: content[language].cardPacks.special.description,
      selectedText: content[language].cardPacks.special.selected,
      unselectedText: content[language].cardPacks.special.unselected,
      available: availablePacks.has("special"),
    },
    {
      id: "windway",
      name: content[language].cardPacks.windway.name,
      description: content[language].cardPacks.windway.description,
      selectedText: content[language].cardPacks.windway.selected,
      unselectedText: content[language].cardPacks.windway.unselected,
      available: availablePacks.has("windway"),
    },
    {
      id: "dual",
      name: content[language].cardPacks.dual.name,
      description: content[language].cardPacks.dual.description,
      selectedText: content[language].cardPacks.dual.selected,
      unselectedText: content[language].cardPacks.dual.unselected,
      available: availablePacks.has("dual"),
    },
  ];

  // Prepare simple status props for SelectionGrid
  const statusMessage = cardValidation.isLoading
    ? content[language].cardValidation.checking
    : `${content[language].cardValidation.availableCards}: ${cardValidation.totalCards}/5`;

  const statusWarning =
    cardValidation.totalCards < 5 && !cardValidation.isLoading
      ? content[language].cardValidation.needMoreCards
      : undefined;

  return (
    <SelectionGrid
      title={content[language].cardPacks.title}
      options={selectionOptions}
      selectedItems={selectedPacks}
      onToggleItem={onTogglePack}
      showDivider={true}
      dividerAfterIndex={4} // Show divider after the first 4 options (normal, senseis, promo, special)
      statusMessage={statusMessage}
      statusWarning={statusWarning}
      isLoading={cardValidation.isLoading}
    />
  );
}
