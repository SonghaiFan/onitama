import { CardPack } from "@/types/game";

/**
 * Card packs that contain only normal cards (AI-compatible)
 */
const NORMAL_CARD_PACKS: Set<CardPack> = new Set([
  "normal",
  "senseis", 
  "promo",
  "special"
]);

/**
 * Card packs that contain special cards (wind cards, mock cards, etc.)
 */
const SPECIAL_CARD_PACKS: Set<CardPack> = new Set([
  "windway", // Contains wind cards
  "dual"     // Contains mock/dual cards
]);

/**
 * Check if AI should be enabled based on selected card packs
 * AI is only enabled when all selected packs contain normal cards only
 */
export function isAICompatible(selectedPacks: Set<CardPack>): boolean {
  // If no packs selected, AI is not compatible
  if (selectedPacks.size === 0) {
    return false;
  }

  // Check if any selected pack contains special cards
  for (const pack of selectedPacks) {
    if (SPECIAL_CARD_PACKS.has(pack)) {
      return false;
    }
  }

  // Check if all selected packs are normal card packs
  for (const pack of selectedPacks) {
    if (!NORMAL_CARD_PACKS.has(pack)) {
      return false;
    }
  }

  return true;
}

/**
 * Get a message explaining why AI is disabled
 */
export function getAIDisabledReason(
  selectedPacks: Set<CardPack>, 
  language: "zh" | "en" = "en"
): string {
  const messages = {
    zh: {
      noPacks: "請先選擇卡牌包",
      specialCards: "AI 僅支援普通卡牌，不支援風靈卡或雙重卡",
      unknownPacks: "選中的卡牌包不兼容 AI"
    },
    en: {
      noPacks: "Please select card packs first",
      specialCards: "AI only supports normal cards, not wind cards or dual cards", 
      unknownPacks: "Selected card packs are not AI compatible"
    }
  };

  const content = messages[language];

  if (selectedPacks.size === 0) {
    return content.noPacks;
  }

  // Check for special card packs
  const hasSpecialPacks = Array.from(selectedPacks).some(pack => 
    SPECIAL_CARD_PACKS.has(pack)
  );

  if (hasSpecialPacks) {
    return content.specialCards;
  }

  return content.unknownPacks;
}