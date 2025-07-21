export type Player = "red" | "blue";

export interface Piece {
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
