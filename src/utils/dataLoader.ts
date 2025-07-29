import { CardPack } from "@/types/game";
import { GameState, MoveCard, Piece, PackCard } from "@/types/game";
import { createInitialGameState } from "./gameManager";

// Cache configuration
const CACHE_KEY_PREFIX = "onitama_pack_";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000; // 1 second

// Cache entry structure
interface CacheEntry {
  data: { cards: MoveCard[]; warning?: string };
  timestamp: number;
  version: string;
}

// Loading states for better UX
interface LoadingState {
  isLoading: boolean;
  progress: number;
  currentPack?: string;
  error?: string;
}

// Event emitter for loading progress
class LoadingEventEmitter {
  private listeners: Map<string, ((state: LoadingState) => void)[]> = new Map();

  on(event: string, callback: (state: LoadingState) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (state: LoadingState) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: string, state: LoadingState) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(state));
    }
  }
}

export const loadingEventEmitter = new LoadingEventEmitter();

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

// Enhanced cache management
class DataCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CURRENT_VERSION = "1.0.0";

  // Load cache from localStorage
  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const keys = Object.keys(localStorage).filter((key) =>
        key.startsWith(CACHE_KEY_PREFIX)
      );

      keys.forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          const entry: CacheEntry = JSON.parse(item);
          const packName = key.replace(CACHE_KEY_PREFIX, "");

          // Check if cache is still valid
          if (this.isCacheValid(entry)) {
            this.cache.set(packName, entry);
          } else {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn("Failed to load cache from storage:", error);
    }
  }

  private isCacheValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const isExpired = now - entry.timestamp > CACHE_EXPIRY_MS;
    const isVersionMismatch = entry.version !== this.CURRENT_VERSION;

    return !isExpired && !isVersionMismatch;
  }

  get(packName: string): { cards: MoveCard[]; warning?: string } | null {
    const entry = this.cache.get(packName);
    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }

    // Remove invalid cache
    if (entry) {
      this.cache.delete(packName);
      localStorage.removeItem(CACHE_KEY_PREFIX + packName);
    }

    return null;
  }

  set(packName: string, data: { cards: MoveCard[]; warning?: string }) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      version: this.CURRENT_VERSION,
    };

    this.cache.set(packName, entry);

    try {
      localStorage.setItem(CACHE_KEY_PREFIX + packName, JSON.stringify(entry));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
      // If localStorage is full, remove oldest entries
      this.cleanupOldestEntries(3);
      try {
        localStorage.setItem(
          CACHE_KEY_PREFIX + packName,
          JSON.stringify(entry)
        );
      } catch {
        // If still failing, continue without localStorage
      }
    }
  }

  private cleanupOldestEntries(count: number) {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, timestamp: entry.timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, count);

    entries.forEach(({ key }) => {
      this.cache.delete(key);
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
    });
  }

  clear() {
    this.cache.clear();
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  getCacheStatus() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
const dataCache = new DataCache();

// Retry utility with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRY_ATTEMPTS,
  baseDelay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Enhanced fetch with timeout and better error handling
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Load individual card pack with enhanced error handling
async function loadCardPack(
  packName: CardPack
): Promise<{ cards: MoveCard[]; warning?: string }> {
  // Check cache first
  const cached = dataCache.get(packName);
  if (cached) {
    return cached;
  }

  try {
    const result = await withRetry(async () => {
      const response = await fetchWithTimeout(
        `/pack/onitama_cards_${packName}.json`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cardData = await response.json();

      if (!cardData.cards || !Array.isArray(cardData.cards)) {
        throw new Error("Invalid card data format");
      }

      const cards = cardData.cards.map(convertCardToGameFormat);

      if (cards.length === 0) {
        throw new Error("No cards found in pack");
      }

      return { cards };
    });

    // Cache successful result
    dataCache.set(packName, result);
    return result;
  } catch (error) {
    const warning = `Failed to load ${packName} card pack: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;

    console.error(warning, error);

    const result = { cards: [], warning };

    // Cache failed result for a shorter time to avoid repeated requests
    dataCache.set(packName, result);

    return result;
  }
}

// Parallel loading of multiple card packs
export async function getCardsForPacks(
  packNames: CardPack[]
): Promise<{ cards: MoveCard[]; warnings: string[] }> {
  if (packNames.length === 0) {
    return { cards: [], warnings: ["No card packs specified"] };
  }

  // Emit loading start
  loadingEventEmitter.emit("loading", {
    isLoading: true,
    progress: 0,
    currentPack: packNames[0],
  });

  try {
    // Load all packs in parallel
    const results = await Promise.all(
      packNames.map(async (packName, index) => {
        loadingEventEmitter.emit("loading", {
          isLoading: true,
          progress: (index / packNames.length) * 100,
          currentPack: packName,
        });

        const result = await loadCardPack(packName);

        loadingEventEmitter.emit("loading", {
          isLoading: true,
          progress: ((index + 1) / packNames.length) * 100,
          currentPack: packName,
        });

        return result;
      })
    );

    // Combine results
    const allCards: MoveCard[] = [];
    const warnings: string[] = [];

    results.forEach((result) => {
      allCards.push(...result.cards);
      if (result.warning) {
        warnings.push(result.warning);
      }
    });

    // Emit loading complete
    loadingEventEmitter.emit("loading", {
      isLoading: false,
      progress: 100,
    });

    return { cards: allCards, warnings };
  } catch (error) {
    // Emit loading error
    loadingEventEmitter.emit("loading", {
      isLoading: false,
      progress: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

// Preload commonly used packs for better performance
export async function preloadCommonPacks(): Promise<void> {
  const commonPacks: CardPack[] = ["normal", "senseis"];

  try {
    await Promise.all(commonPacks.map((pack) => loadCardPack(pack)));
  } catch (error) {
    console.warn("Failed to preload common packs:", error);
  }
}

// Enhanced card selection with better randomization
export async function selectRandomCardsAsync(
  cardPacks: CardPack[] = ["normal"]
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
    return selectWindwayCards(allCards, warnings);
  } else {
    return selectRegularCards(allCards, warnings);
  }
}

// Improved randomization using Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectWindwayCards(
  allCards: MoveCard[],
  warnings: string[]
): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
  warnings: string[];
} {
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
  const shuffledWindCards = shuffleArray(windCards);
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
  const shuffledRemainingCards = shuffleArray(remainingCards);
  const selectedRemainingCards = shuffledRemainingCards.slice(0, 2);

  // Combine and shuffle the final selection
  const selected = shuffleArray([
    ...selectedWindCards,
    ...selectedRemainingCards,
  ]);

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
    warnings,
  };
}

function selectRegularCards(
  allCards: MoveCard[],
  warnings: string[]
): {
  playerCards: MoveCard[];
  sharedCard: MoveCard;
  warnings: string[];
} {
  const shuffled = shuffleArray(allCards);
  const selected = shuffled.slice(0, 5);

  return {
    playerCards: selected.slice(0, 4),
    sharedCard: selected[4],
    warnings,
  };
}

// Create initial board setup (unchanged but optimized)
function createInitialBoard(
  includeWindSpirit: boolean = false
): (Piece | null)[][] {
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

// Enhanced game creation with better error handling
export async function createNewGameAsync(
  cardPacks: CardPack[] = ["normal"]
): Promise<{ gameState: GameState; warnings: string[] }> {
  const { playerCards, sharedCard, warnings } = await selectRandomCardsAsync(
    cardPacks
  );

  if (playerCards.length === 0 || !sharedCard.name) {
    throw new Error("Failed to create game: insufficient cards loaded");
  }

  const includeWindSpirit = cardPacks.includes("windway");

  // Determine starting player based on shared card color
  const startingPlayer = sharedCard.color || "red";

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

// Enhanced availability checking with better performance
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

  try {
    const { cards, warnings } = await getCardsForPacks(
      Array.from(selectedPacks)
    );
    const totalCards = cards.length;
    const hasEnoughCards = totalCards >= 5;

    // Determine failed packs based on warnings
    const failedPacks = new Set<CardPack>();
    warnings.forEach((warning) => {
      selectedPacks.forEach((pack) => {
        if (warning.includes(pack)) {
          failedPacks.add(pack);
        }
      });
    });

    if (!hasEnoughCards) {
      warnings.push(
        `Not enough cards available. Need 5 cards, but only ${totalCards} cards were loaded.`
      );
    }

    return { hasEnoughCards, totalCards, warnings, failedPacks };
  } catch (error) {
    return {
      hasEnoughCards: false,
      totalCards: 0,
      warnings: [
        `Failed to check card availability: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
      failedPacks: new Set(selectedPacks),
    };
  }
}

// Enhanced pack availability checking with parallel requests
export async function checkAllPacks(): Promise<Set<CardPack>> {
  const allPacks: CardPack[] = [
    "normal",
    "senseis",
    "windway",
    "promo",
    "dual",
    "special",
  ];

  // Check all packs in parallel
  const results = await Promise.allSettled(
    allPacks.map(async (packName) => {
      try {
        const response = await fetchWithTimeout(
          `/pack/onitama_cards_${packName}.json`,
          5000
        );
        if (response.ok) {
          const cardData = await response.json();
          if (cardData.cards && Array.isArray(cardData.cards)) {
            return packName;
          }
        }
        return null;
      } catch {
        return null;
      }
    })
  );

  const availablePacks = new Set<CardPack>();
  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      availablePacks.add(result.value);
    }
  });

  return availablePacks;
}

// Utility functions for cache management
export const cacheUtils = {
  getCacheStatus: () => dataCache.getCacheStatus(),
  clearCache: () => dataCache.clear(),
  preloadCommonPacks,
  isPackCached: (packName: CardPack) => dataCache.get(packName) !== null,
};

// Initialize preloading on module load
if (typeof window !== "undefined") {
  // Only preload in browser environment
  setTimeout(() => {
    preloadCommonPacks().catch(console.warn);
  }, 1000); // Delay to not block initial page load
}
