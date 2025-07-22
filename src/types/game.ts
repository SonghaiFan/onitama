export type Player = "red" | "blue";

export interface Piece {
  id: string; // Unique identifier like "red_1", "blue_master", etc.
  player: Player;
  isMaster: boolean;
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
  color: Player;
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
  firstPlayerColor: Player;
}

export interface SenseisCardPack {
  metadata: SenseisCardPackMetadata;
  cards: SenseisCardPackCard[];
}
