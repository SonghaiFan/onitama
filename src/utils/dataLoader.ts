import { CardPack } from "@/components/landing/CardPackSelection";
import { GameState, MoveCard, Piece, PackCard } from "@/types/game";
import { createInitialGameState } from "./gameManager";

// Convert card data from JSON format to our game format
function convertCardToGameFormat(card: PackCard): MoveCard {
  return {
    name: card.name.en,
    displayName: card.name.zh,
    type: card.type,
    moves: card.moves,
    wind_move: card.wind_move,
    master_moves: card.master_moves,
    student_moves: card.student_moves,
    color: card.firstPlayerColor === "red" ? "red" : "blue",
    isWindCard: card.type === "wind_card",
    isMockCard: card.type === "mock_card",
  };
}

// Function to load card pack data
async function loadCardPack(
  packName: "normal" | "senseis" | "windway" | "promo" | "dual" | "special"
): Promise<{ cards: MoveCard[]; warning?: string }> {
  try {
    const response = await fetch(`/pack/onitama_16_cards_${packName}.json`);
    if (!response.ok) {
      return {
        cards: [],
        warning: `Failed to load ${packName} card pack: HTTP ${response.status}`,
      };
    }
    const cardData = await response.json();
    const cards = cardData.cards.map(convertCardToGameFormat);

    if (cards.length === 0) {
      return {
        cards: [],
        warning: `No cards found in ${packName} card pack`,
      };
    }

    return { cards };
  } catch (error) {
    console.error(`Failed to load ${packName} card pack:`, error);
    return {
      cards: [],
      warning: `Failed to load ${packName} card pack: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}

// Cache for loaded card packs
const cardPackCache: Record<string, { cards: MoveCard[]; warning?: string }> =
  {};

// Function to get cards for multiple packs
async function getCardsForPacks(
  packNames: ("normal" | "senseis" | "windway" | "promo" | "dual" | "special")[]
): Promise<{ cards: MoveCard[]; warnings: string[] }> {
  const allCards: MoveCard[] = [];
  const warnings: string[] = [];

  for (const packName of packNames) {
    if (cardPackCache[packName]) {
      const cached = cardPackCache[packName];
      allCards.push(...cached.cards);
      if (cached.warning) {
        warnings.push(cached.warning);
      }
    } else {
      const result = await loadCardPack(packName);
      cardPackCache[packName] = result;
      allCards.push(...result.cards);
      if (result.warning) {
        warnings.push(result.warning);
      }
    }
  }

  return { cards: allCards, warnings };
}

// Function to randomly select 5 cards from multiple packs
async function selectRandomCardsAsync(
  cardPacks: (
    | "normal"
    | "senseis"
    | "windway"
    | "promo"
    | "dual"
    | "special"
  )[] = ["normal"]
): Promise<{
  playerCards: MoveCard[];
  sharedCard: MoveCard;
  warnings: string[];
}> {
  const { cards: allCards, warnings } = await getCardsForPacks(cardPacks);

  if (allCards.length < 5) {
    warnings.push(
      `Not enough cards available. Need 5 cards, but only ${allCards.length} cards were loaded.`
    );
    return {
      playerCards: [],
      sharedCard: {} as MoveCard,
      warnings,
    };
  }

  // Check if windway pack is included
  const includeWindway = cardPacks.includes("windway");

  if (includeWindway) {
    // Separate wind cards from non-wind cards
    const windCards = allCards.filter((card) => card.isWindCard);
    const nonWindCards = allCards.filter((card) => !card.isWindCard);

    // Check if we have enough wind cards
    if (windCards.length < 3) {
      warnings.push(
        `Not enough wind cards available. Need at least 3 wind cards, but only ${windCards.length} wind cards were loaded.`
      );
      return {
        playerCards: [],
        sharedCard: {} as MoveCard,
        warnings,
      };
    }

    // Select exactly 3 wind cards randomly
    const shuffledWindCards = [...windCards].sort(() => Math.random() - 0.5);
    const selectedWindCards = shuffledWindCards.slice(0, 3);

    // Get remaining cards (both wind and non-wind) for the last 2 slots
    const remainingWindCards = shuffledWindCards.slice(3);
    const remainingCards = [...remainingWindCards, ...nonWindCards];

    // Check if we have enough remaining cards
    if (remainingCards.length < 2) {
      warnings.push(
        `Not enough remaining cards available. Need at least 2 more cards, but only ${remainingCards.length} cards were loaded.`
      );
      return {
        playerCards: [],
        sharedCard: {} as MoveCard,
        warnings,
      };
    }

    // Randomly select 2 more cards from the remaining cards
    const shuffledRemainingCards = [...remainingCards].sort(
      () => Math.random() - 0.5
    );
    const selectedRemainingCards = shuffledRemainingCards.slice(0, 2);

    // Combine and shuffle the final selection
    const selected = [...selectedWindCards, ...selectedRemainingCards].sort(
      () => Math.random() - 0.5
    );

    return {
      playerCards: selected.slice(0, 4),
      sharedCard: selected[4],
      warnings,
    };
  } else {
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);

    return {
      playerCards: selected.slice(0, 4),
      sharedCard: selected[4],
      warnings,
    };
  }
}

// Create initial board setup
function createInitialBoard(
  includeWindSpirit: boolean = false
): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));

  // Red player (bottom) pieces
  board[4][2] = {
    id: "red_master",
    player: "red",
    isMaster: true,
    position: [4, 2],
  }; // Master on Temple Arch
  board[4][0] = {
    id: "red_1",
    player: "red",
    isMaster: false,
    position: [4, 0],
  };
  board[4][1] = {
    id: "red_2",
    player: "red",
    isMaster: false,
    position: [4, 1],
  };
  board[4][3] = {
    id: "red_3",
    player: "red",
    isMaster: false,
    position: [4, 3],
  };
  board[4][4] = {
    id: "red_4",
    player: "red",
    isMaster: false,
    position: [4, 4],
  };

  // Blue player (top) pieces
  board[0][2] = {
    id: "blue_master",
    player: "blue",
    isMaster: true,
    position: [0, 2],
  }; // Master on Temple Arch
  board[0][0] = {
    id: "blue_1",
    player: "blue",
    isMaster: false,
    position: [0, 0],
  };
  board[0][1] = {
    id: "blue_2",
    player: "blue",
    isMaster: false,
    position: [0, 1],
  };
  board[0][3] = {
    id: "blue_3",
    player: "blue",
    isMaster: false,
    position: [0, 3],
  };
  board[0][4] = {
    id: "blue_4",
    player: "blue",
    isMaster: false,
    position: [0, 4],
  };

  if (includeWindSpirit) {
    board[2][2] = {
      id: "wind_spirit",
      player: "neutral",
      isMaster: false,
      isWindSpirit: true,
      position: [2, 2],
    };
  }

  return board;
}

export const INITIAL_GAME_STATE: GameState = createInitialGameState(
  createInitialBoard(),
  {
    red: { cards: [] },
    blue: { cards: [] },
  },
  {} as MoveCard,
  "red"
);

// Async version for loading card packs
export async function createNewGameAsync(
  cardPacks: (
    | "normal"
    | "senseis"
    | "windway"
    | "promo"
    | "dual"
    | "special"
  )[] = ["normal"]
): Promise<{ gameState: GameState; warnings: string[] }> {
  const { playerCards, sharedCard, warnings } = await selectRandomCardsAsync(
    cardPacks
  );
  const includeWindSpirit = cardPacks.includes("windway");

  // Determine starting player based on shared card color
  const startingPlayer = sharedCard.color;

  return {
    gameState: createInitialGameState(
      createInitialBoard(includeWindSpirit),
      {
        red: {
          cards: [playerCards[0], playerCards[1]],
        },
        blue: {
          cards: [playerCards[2], playerCards[3]],
        },
      },
      sharedCard,
      startingPlayer,
      cardPacks
    ),
    warnings,
  };
}

// Function to check if selected packs have enough cards
export async function checkCardAvailability(
  selectedPacks: Set<CardPack>
): Promise<{
  hasEnoughCards: boolean;
  totalCards: number;
  warnings: string[];
  failedPacks: Set<CardPack>;
}> {
  if (selectedPacks.size === 0) {
    return {
      hasEnoughCards: false,
      totalCards: 0,
      warnings: ["No card packs selected"],
      failedPacks: new Set(),
    };
  }

  const allCards: PackCard[] = [];
  const warnings: string[] = [];
  const failedPacks = new Set<CardPack>();

  for (const packName of selectedPacks) {
    try {
      const response = await fetch(`/pack/onitama_16_cards_${packName}.json`);
      if (!response.ok) {
        warnings.push(
          `Failed to load ${packName} pack: HTTP ${response.status}`
        );
        failedPacks.add(packName);
        continue;
      }
      const cardData = await response.json();
      if (cardData.cards && Array.isArray(cardData.cards)) {
        allCards.push(...cardData.cards);
      } else {
        warnings.push(`Invalid card data in ${packName} pack`);
        failedPacks.add(packName);
      }
    } catch (error) {
      warnings.push(
        `Failed to load ${packName} pack: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      failedPacks.add(packName);
    }
  }

  const totalCards = allCards.length;
  const hasEnoughCards = totalCards >= 5;

  if (!hasEnoughCards) {
    warnings.push(
      `Not enough cards available. Need 5 cards, but only ${totalCards} cards were loaded.`
    );
  }

  return { hasEnoughCards, totalCards, warnings, failedPacks };
}

// Function to check all available packs
export async function checkAllPacks(): Promise<Set<CardPack>> {
  const allPacks: CardPack[] = [
    "normal",
    "senseis",
    "windway",
    "promo",
    "dual",
    "special",
  ];
  const availablePacks = new Set<CardPack>();

  for (const packName of allPacks) {
    try {
      const response = await fetch(`/pack/onitama_16_cards_${packName}.json`);
      if (response.ok) {
        const cardData = await response.json();
        if (cardData.cards && Array.isArray(cardData.cards)) {
          availablePacks.add(packName);
        }
      }
    } catch {
      // Silently skip failed packs
    }
  }

  return availablePacks;
}
