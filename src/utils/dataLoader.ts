import { CardPack } from "@/types/game";
import { GameState, MoveCard, Piece, PackCard } from "@/types/game";
import { createInitialGameState } from "./gameManager";

// Simple in-memory cache for loaded packs
const cardCache = new Map<CardPack, MoveCard[]>();

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

// Simple fetch wrapper
async function fetchCards(packName: CardPack): Promise<MoveCard[]> {
  try {
    const response = await fetch(`/pack/onitama_cards_${packName}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${packName} pack`);
    }

    const cardData = await response.json();
    
    if (!cardData.cards || !Array.isArray(cardData.cards)) {
      throw new Error(`Invalid card data in ${packName} pack`);
    }

    return cardData.cards.map(convertCardToGameFormat);
  } catch (error) {
    console.error(`Error loading ${packName} pack:`, error);
    return [];
  }
}

// Load individual card pack
async function loadCardPack(packName: CardPack): Promise<MoveCard[]> {
  // Check cache first
  if (cardCache.has(packName)) {
    return cardCache.get(packName)!;
  }

  // Load from file
  const cards = await fetchCards(packName);
  
  // Cache the result
  if (cards.length > 0) {
    cardCache.set(packName, cards);
  }

  return cards;
}

// Load multiple card packs
export async function getCardsForPacks(cardPacks: CardPack[]): Promise<MoveCard[]> {
  if (cardPacks.length === 0) {
    return [];
  }

  const results = await Promise.all(
    cardPacks.map(packName => loadCardPack(packName))
  );

  return results.flat();
}

// Select random cards for game
export async function selectRandomCardsAsync(
  cardPacks: CardPack[] = ["normal"]
): Promise<{
  playerCards: MoveCard[];
  sharedCard: MoveCard;
}> {
  console.log("🎮 Starting card selection for packs:", cardPacks);
  const allCards = await getCardsForPacks(cardPacks);

  if (allCards.length < 5) {
    throw new Error(`Not enough cards available. Need 5 cards, but only ${allCards.length} cards were loaded.`);
  }

  // Check if windway pack is included - special selection rules
  const includeWindway = cardPacks.includes("windway");
  console.log("🌪️ Include windway pack:", includeWindway);

  if (includeWindway) {
    return selectWindwayCards(allCards);
  } else {
    return selectRegularCards(allCards);
  }
}

// Simple Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Special selection for windway pack (must include 3 wind cards)
function selectWindwayCards(allCards: MoveCard[]): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
} {
  console.log("🌪️ Windway pack detected - using special selection");
  console.log("Total cards:", allCards.length);
  
  // Separate wind cards from non-wind cards
  const windCards = allCards.filter((card) => card.isWindCard);
  const nonWindCards = allCards.filter((card) => !card.isWindCard);

  console.log("Wind cards found:", windCards.length, windCards.map(c => c.name));
  console.log("Non-wind cards found:", nonWindCards.length);

  // Check if we have enough wind cards
  if (windCards.length < 3) {
    throw new Error(`Not enough wind cards available. Need at least 3 wind cards, but only ${windCards.length} wind cards were loaded.`);
  }

  // Select exactly 3 wind cards randomly
  const shuffledWindCards = shuffleArray(windCards);
  const selectedWindCards = shuffledWindCards.slice(0, 3);

  // Get remaining cards (both wind and non-wind) for the last 2 slots
  const remainingWindCards = shuffledWindCards.slice(3);
  const remainingCards = [...remainingWindCards, ...nonWindCards];

  // Check if we have enough remaining cards
  if (remainingCards.length < 2) {
    throw new Error(`Not enough remaining cards available. Need at least 2 more cards, but only ${remainingCards.length} cards were loaded.`);
  }

  // Randomly select 2 more cards from the remaining cards
  const shuffledRemainingCards = shuffleArray(remainingCards);
  const selectedRemainingCards = shuffledRemainingCards.slice(0, 2);

  // Combine and shuffle the final selection
  const selected = shuffleArray([
    ...selectedWindCards,
    ...selectedRemainingCards,
  ]);

  console.log("Selected cards:", selected.map(c => `${c.name} (${c.isWindCard ? 'wind' : 'normal'})`));

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
  };
}

// Regular selection for non-windway packs
function selectRegularCards(allCards: MoveCard[]): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
} {
  const shuffled = shuffleArray(allCards);
  const selected = shuffled.slice(0, 5);

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
  };
}

// Create initial board setup
function createInitialBoard(includeWindSpirit: boolean = false): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(5)
    .fill(null)
    .map(() => Array(5).fill(null));

  // Red player (bottom) pieces
  const redPieces = [
    { id: "red_master", isMaster: true, position: [4, 2] as [number, number] },
    { id: "red_1", isMaster: false, position: [4, 0] as [number, number] },
    { id: "red_2", isMaster: false, position: [4, 1] as [number, number] },
    { id: "red_3", isMaster: false, position: [4, 3] as [number, number] },
    { id: "red_4", isMaster: false, position: [4, 4] as [number, number] },
  ];

  redPieces.forEach((piece) => {
    board[piece.position[0]][piece.position[1]] = {
      ...piece,
      player: "red",
    };
  });

  // Blue player (top) pieces
  const bluePieces = [
    { id: "blue_master", isMaster: true, position: [0, 2] as [number, number] },
    { id: "blue_1", isMaster: false, position: [0, 0] as [number, number] },
    { id: "blue_2", isMaster: false, position: [0, 1] as [number, number] },
    { id: "blue_3", isMaster: false, position: [0, 3] as [number, number] },
    { id: "blue_4", isMaster: false, position: [0, 4] as [number, number] },
  ];

  bluePieces.forEach((piece) => {
    board[piece.position[0]][piece.position[1]] = {
      ...piece,
      player: "blue",
    };
  });

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

// Create new game
export async function createNewGameAsync(
  cardPacks: CardPack[] = ["normal"]
): Promise<GameState> {
  console.log("🎯 Creating new game with packs:", cardPacks);
  const { playerCards, sharedCard } = await selectRandomCardsAsync(cardPacks);

  if (playerCards.length === 0 || !sharedCard.name) {
    throw new Error("Failed to create game: insufficient cards loaded");
  }

  const includeWindSpirit = cardPacks.includes("windway");
  console.log("🌪️ Including wind spirit on board:", includeWindSpirit);
  const startingPlayer = sharedCard.color || "red";

  const gameState = createInitialGameState(
    createInitialBoard(includeWindSpirit),
    {
      red: { cards: [playerCards[0], playerCards[1]] },
      blue: { cards: [playerCards[2], playerCards[3]] },
    },
    sharedCard,
    startingPlayer,
    cardPacks
  );

  // Check if wind spirit is on the board
  const windSpirit = gameState.board[2][2];
  console.log("🌪️ Wind spirit on board:", windSpirit ? "YES" : "NO", windSpirit);

  return gameState;
}

// Check card availability
export async function checkCardAvailability(
  selectedPacks: Set<CardPack>
): Promise<{
  hasEnoughCards: boolean;
  totalCards: number;
}> {
  if (selectedPacks.size === 0) {
    return { hasEnoughCards: false, totalCards: 0 };
  }

  try {
    const cards = await getCardsForPacks(Array.from(selectedPacks));
    const totalCards = cards.length;
    return { hasEnoughCards: totalCards >= 5, totalCards };
  } catch (error) {
    console.error("Failed to check card availability:", error);
    return { hasEnoughCards: false, totalCards: 0 };
  }
}

// Check which packs are available
export async function checkAllPacks(): Promise<Set<CardPack>> {
  const allPacks: CardPack[] = ["normal", "senseis", "windway", "promo", "dual", "special"];
  const availablePacks = new Set<CardPack>();

  await Promise.allSettled(
    allPacks.map(async (packName) => {
      try {
        const response = await fetch(`/pack/onitama_cards_${packName}.json`);
        if (response.ok) {
          const cardData = await response.json();
          if (cardData.cards && Array.isArray(cardData.cards)) {
            availablePacks.add(packName);
          }
        }
      } catch {
        // Pack not available, skip it
      }
    })
  );

  return availablePacks;
}
