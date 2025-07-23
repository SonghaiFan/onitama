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
  displayName?: string;
  moves: Move[];
  wind_move?: Move[]; // Add wind moves for wind spirit cards
  color: Player;
  isWindSpiritCard?: boolean; // Flag to identify wind spirit cards
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
}

// Type for the Sensei's Path card pack JSON structure
export interface SenseisCardPackMetadata {
  name: string;
  description: string;
  author: string;
  version: string;
}

export interface SenseisCardPackCard {
  id: string;
  name: {
    en: string;
    hu?: string;
    zh?: string;
    ja?: string;
  };
  color: string;
  moves: Move[];
  wind_move?: Move[];
  firstPlayerColor: Player;
  type?: "wind_spirit" | "move_card"; // Card type for wind spirit vs regular cards
}

export interface SenseisCardPack {
  metadata: SenseisCardPackMetadata;
  cards: SenseisCardPackCard[];
}
