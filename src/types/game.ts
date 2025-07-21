export type Player = "player1" | "player2";

export type PieceType = "master" | "student";

export interface Position {
  row: number;
  col: number;
}

export interface GamePiece {
  type: PieceType;
  player: Player;
  position: Position;
}

export interface MoveCard {
  name: string;
  pattern: string[][];
  color: Player;
}

export interface PlayerState {
  cards: MoveCard[];
}

export interface GameState {
  board: (GamePiece | null)[][];
  players: {
    player1: PlayerState;
    player2: PlayerState;
  };
  sharedCard: MoveCard;
  currentPlayer: Player;
  selectedPiece: Position | null;
  selectedCard: number | null;
  winner: Player | null;
  gamePhase: "setup" | "playing" | "finished";
}
