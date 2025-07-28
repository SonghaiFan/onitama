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
    const config = await this.getTacticalConfig();
    const moves = this.generateLegalMoves(gameState, player);

    if (moves.length === 0) {
      throw new Error("No valid moves available for AI");
    }

    // Emit initial thinking update with a starting evaluation
    const initialScore = this.evaluateState(gameState, player, config);
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
      score = config.evaluation.terminal.masterCapturePriority; // Clear win
      
      this.emitThinkingUpdate({
        score: config.evaluation.scoreDisplay.clearWin.min + 
               Math.random() * (config.evaluation.scoreDisplay.clearWin.max - config.evaluation.scoreDisplay.clearWin.min),
        depth: 1,
        nodesEvaluated: moves.length,
        bestMoveFound: {
          from: selectedMove.from,
          to: selectedMove.to,
          cardIndex: selectedMove.cardIndex,
        },
      });
    } else if (Math.random() < config.algorithm.randomness.easyAI.capturePreference) {
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
      score = this.evaluateState(simState, player, config);
      
      // Normalize the score for UI display with more variance
      const displayScore = score >= config.evaluation.terminal.templeArchReached ? 
                          config.evaluation.scoreDisplay.clearWin.min + Math.random() * config.algorithm.randomness.easyAI.displayVariance.winning :
                          score <= -config.evaluation.terminal.templeArchReached ? 
                          config.evaluation.scoreDisplay.clearLoss.min + Math.random() * config.algorithm.randomness.easyAI.displayVariance.losing :
                          score * config.evaluation.scoreDisplay.normalScaling + (Math.random() - 0.5) * config.algorithm.randomness.easyAI.displayVariance.normal;
      
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
        const finalDisplayScore = score >= config.evaluation.terminal.templeArchReached ? 
                                  config.evaluation.scoreDisplay.clearWin.min + Math.random() * 7 :
                                  score <= -config.evaluation.terminal.templeArchReached ? 
                                  config.evaluation.scoreDisplay.clearLoss.min + Math.random() * 5 :
                                  score * config.evaluation.scoreDisplay.normalScaling + (Math.random() - 0.5) * 6;
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
      }, config.algorithm.randomness.easyAI.thinkingDelay);
    } else {
      // Use minimax with depth 1
      const result = await this.findBestMoveWithMinimax(gameState, player, 1);
      selectedMove = result.move;
      score = result.score;
    }

    const thinkingTime = Date.now() - this.startTime;

    // Final score normalization for UI
    const finalDisplayScore = score >= config.evaluation.terminal.templeArchReached ? 
                             config.evaluation.scoreDisplay.clearWin.min + Math.random() * 8 :
                             score <= -config.evaluation.terminal.templeArchReached ? 
                             config.evaluation.scoreDisplay.clearLoss.max + Math.random() * 8 :
                             score * config.evaluation.scoreDisplay.normalScaling + (Math.random() - 0.5) * 3;

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
