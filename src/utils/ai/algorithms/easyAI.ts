import { GameState, Player } from "@/types/game";
import { BaseAI, AIMoveResult } from "./baseAI";
import { MoveWithMetadata } from "@/utils/gameManager";

export class EasyAI extends BaseAI {
  constructor() {
    super(1, 1000); // Very shallow search, quick thinking
  }

  async findBestMove(
    gameState: GameState,
    player: Player
  ): Promise<AIMoveResult> {
    this.startTime = Date.now();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Emit initial thinking update with a starting evaluation
    const initialScore = this.evaluateState(gameState, player);
    this.emitThinkingUpdate({
      score: initialScore,
      depth: 1,
      nodesEvaluated: 0,
    });

    let selectedMove: MoveWithMetadata;
    let score: number;

    // Check for immediate winning moves first!
    const masterCaptures = moves.filter(move => {
      if (!move.isCapture) return false;
      const targetPiece = gameState.board[move.to[0]][move.to[1]];
      return targetPiece?.isMaster === true;
    });

    if (masterCaptures.length > 0) {
      // Found a master capture - take it immediately!
      selectedMove = masterCaptures[0];
      score = 999; // Clear win
      
      this.emitThinkingUpdate({
        score: 95 + Math.random() * 4, // Show as clear winning move
        depth: 1,
        nodesEvaluated: moves.length,
        bestMoveFound: {
          from: selectedMove.from,
          to: selectedMove.to,
          cardIndex: selectedMove.cardIndex,
        },
      });
    } else if (Math.random() < 0.8) {
      // 80% chance to use improved capture logic, 20% use minimax
      const captures = moves.filter((move) => move.isCapture);

      if (captures.length > 0) {
        // Prioritize captures, especially of valuable pieces
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      }

      // Simulate the move to get a better evaluation
      const simState = this.simulateMove(gameState, selectedMove);
      score = this.evaluateState(simState, player);
      
      // Normalize the score for UI display with more variance
      const displayScore = score >= 9000 ? 85 + Math.random() * 10 : // Winning: 85-95
                          score <= -9000 ? -95 + Math.random() * 10 : // Losing: -95 to -85  
                          score * 0.1 + (Math.random() - 0.5) * 8; // Normal: scaled with larger variance
      
      // Emit mid-thinking update with normalized score
      this.emitThinkingUpdate({
        score: displayScore,
        depth: 1,
        nodesEvaluated: Math.floor(moves.length / 2),
        bestMoveFound: {
          from: selectedMove.from,
          to: selectedMove.to,
          cardIndex: selectedMove.cardIndex,
        },
      });
      
      // Add a second thinking update to show progression
      setTimeout(() => {
        const finalDisplayScore = score >= 9000 ? 88 + Math.random() * 7 : 
                                 score <= -9000 ? -95 + Math.random() * 5 :
                                 score * 0.1 + (Math.random() - 0.5) * 6;
        this.emitThinkingUpdate({
          score: finalDisplayScore,
          depth: 1,
          nodesEvaluated: moves.length,
          bestMoveFound: {
            from: selectedMove.from,
            to: selectedMove.to,
            cardIndex: selectedMove.cardIndex,
          },
        });
      }, 150);
    } else {
      // Use minimax with depth 1
      const result = this.findBestMoveWithMinimax(gameState, player, 1);
      selectedMove = result.move;
      score = result.score;
    }

    const thinkingTime = Date.now() - this.startTime;

    // Final score normalization for UI
    const finalDisplayScore = score >= 9000 ? 90 + Math.random() * 8 : // Winning: 90-98
                             score <= -9000 ? -98 + Math.random() * 8 : // Losing: -98 to -90
                             score * 0.1 + (Math.random() - 0.5) * 3; // Normal: scaled with variance

    // Emit final thinking update
    this.emitThinkingUpdate({
      score: finalDisplayScore,
      depth: 1,
      nodesEvaluated: moves.length,
      bestMoveFound: {
        from: selectedMove.from,
        to: selectedMove.to,
        cardIndex: selectedMove.cardIndex,
      },
    });

    return {
      move: selectedMove,
      score,
      depth: 1,
      nodesEvaluated: moves.length,
      thinkingTime,
    };
  }
}
