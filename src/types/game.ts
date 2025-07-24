export type Player = "red" | "blue";

export interface Piece {
  id: string; // Unique identifier like "red_1", "blue_master", "wind_spirit", etc.
  player: Player | "neutral"; // Add neutral for wind spirit
  isMaster: boolean;
  isWindSpirit?: boolean; // New property for wind spirit
  position: [number, number];
}

export interface Move {
  x: number;
  y: number;
}

export interface MoveCard {
  name: string;
  type: "wind_card" | "normal_card" | "mock_card";
  displayName?: string;
  moves: Move[];
  wind_move?: Move[]; // Add wind moves for wind spirit cards
  master_moves?: Move[]; // Add master moves for dual cards
  student_moves?: Move[]; // Add student moves for dual cards
  color: Player;
  isMockCard?: boolean; // Flag to identify dual cards
  isWindCard?: boolean; // Flag to identify wind spirit cards
}

export interface PlayerState {
  cards: MoveCard[];
}

export interface GameState {
  board: (Piece | null)[][];
  players: {
    red: PlayerState;
    blue: PlayerState;
  };
  sharedCard: MoveCard;
  currentPlayer: Player;
  selectedPiece: [number, number] | null;
  selectedCard: number | null;
  windSpiritPosition: [number, number] | null; // Track wind spirit position
  winner: Player | null;
  gamePhase: "setup" | "playing" | "finished";
  cardPacks?: ("normal" | "senseis" | "windway" | "promo" | "dual")[]; // Track which packs are active
  // New properties for wind spirit dual move execution
  isDualMoveInProgress?: boolean; // Whether we're in the middle of a dual move
  firstMove?: {
    from: [number, number];
    to: [number, number];
    cardIndex: number;
  }; // Track the first move of a dual move sequence
}

// Type for the Sensei's Path card pack JSON structure
export interface PackMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
}

export interface PackCard {
  id: string;
  type: "wind_card" | "normal_card" | "mock_card";
  name: {
    en: string;
    hu?: string;
    zh?: string;
    ja?: string;
  };
  color: string;
  moves: Move[];
  wind_move?: Move[];
  master_moves?: Move[];
  student_moves?: Move[];
  firstPlayerColor: Player;
}

export interface Pack {
  metadata: PackMetadata;
  cards: PackCard[];
}
