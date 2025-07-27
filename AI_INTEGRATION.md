# Onitama AI Integration Guide

This document explains the advanced Minimax AI features integrated into your Onitama game.

## 🎯 Overview

The AI integration provides three main features:

1. **Human vs AI** - Play against an AI opponent using Minimax algorithm
2. **AI vs AI** - Watch two AIs play against each other
3. **Move Analysis** - See AI thinking process and position evaluation

## 🏗️ Architecture

### Components

1. **`aiManager.ts`** - Core AI management utility

   - Minimax algorithm with Alpha-Beta pruning
   - Iterative deepening for time management
   - Move ordering optimization
   - Advanced position evaluation

2. **`AIGameController.tsx`** - AI game interface

   - Real-time AI status display
   - Move analysis and thinking time
   - Position evaluation

3. **`GameModeSelector.tsx`** - Game mode selection
   - Human vs Human, Human vs AI, AI vs AI modes
   - Difficulty selection (Easy, Medium, Hard)
   - AI player selection

### AI Implementation

The system uses **advanced Minimax with Alpha-Beta pruning**:

- **Minimax Algorithm** - Simulates future moves to find optimal play
- **Alpha-Beta Pruning** - Dramatically improves search efficiency
- **Iterative Deepening** - Better time management and move quality
- **Move Ordering** - Optimizes pruning effectiveness
- **Advanced Evaluation** - Sophisticated position assessment

## 🚀 Quick Start

### 1. Start the Game

```bash
npm run dev
```

### 2. Enable AI Mode

The AI is automatically enabled. When you start a new game, you'll see:

- Game mode selection dialog
- AI difficulty options
- AI player selection

## 🎮 Game Modes

### Human vs Human

- Traditional two-player gameplay
- No AI involvement

### Human vs AI

- Play against an AI opponent
- Choose which player is AI (Red or Blue)
- Select difficulty level

### AI vs AI

- Watch two AIs play against each other
- Great for learning strategies
- Same difficulty for both AIs

## 🧠 AI Difficulty Levels

### Easy

- **Search Depth**: 2 moves ahead
- **Randomness**: 70% chance of suboptimal moves
- **Time Limit**: 1 second
- **Strategy**: Basic tactical play with Minimax

### Medium

- **Search Depth**: 3 moves ahead
- **Randomness**: 30% chance of suboptimal moves
- **Time Limit**: 2 seconds
- **Strategy**: Balanced Minimax with Alpha-Beta pruning

### Hard

- **Search Depth**: 4 moves ahead
- **Randomness**: 10% chance of suboptimal moves
- **Time Limit**: 3 seconds
- **Strategy**: Advanced Minimax with full optimization

## 🔧 Technical Details

### Minimax Algorithm with Alpha-Beta Pruning

The core AI uses the classic Minimax algorithm:

```typescript
private minimax(gameState: GameState, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
  // Terminal conditions
  if (depth === 0 || this.isGameOver(gameState)) {
    return this.evaluatePosition(gameState, maximizingPlayer ? 'red' : 'blue');
  }

  const possibleMoves = this.generateAllLegalMoves(gameState);

  if (maximizingPlayer) {
    let maxEval = -Infinity;

    for (const move of possibleMoves) {
      const newState = this.simulateMove(gameState, move);
      const evaluation = this.minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;

    for (const move of possibleMoves) {
      const newState = this.simulateMove(gameState, move);
      const evaluation = this.minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    return minEval;
  }
}
```

### Iterative Deepening

For better time management and move quality:

```typescript
// Iterative deepening for better time management
for (let depth = 1; depth <= maxDepth; depth++) {
  // Search at current depth
  // Update best move if better found
  // Check time limit
}
```

### Move Ordering Optimization

Moves are sorted by heuristic for better pruning:

```typescript
private sortMovesByHeuristic(gameState: GameState, moves: AIMove[]): AIMove[] {
  return moves.sort((a, b) => {
    const scoreA = this.quickMoveEvaluation(gameState, a);
    const scoreB = this.quickMoveEvaluation(gameState, b);
    return scoreB - scoreA; // Higher scores first
  });
}
```

### Advanced Position Evaluation

The evaluation function considers multiple factors:

```typescript
evaluatePosition(gameState: GameState, player: Player): number {
  let score = 0;

  // Immediate win/loss detection
  const winner = checkWinConditions(gameState);
  if (winner === player) return 10000;
  if (winner && winner !== player) return -10000;

  // Piece values and positioning
  // Master advancement toward temple
  // Center control
  // Tactical positioning
  // Card advantage

  return score;
}
```

## 🎨 UI Features

### AI Status Panel

- Shows current AI player and difficulty
- Displays thinking status with spinner
- Real-time position evaluation
- Last move analysis with score

### Move Analysis

- Best move coordinates (chess notation)
- Thinking time in milliseconds
- Move quality score
- Search depth reached

### Bilingual Support

All AI interface text supports Chinese and English:

- Game mode selection
- Difficulty levels
- AI status messages
- Move analysis

## 🧠 AI Intelligence Features

### Strategic Thinking

- **Minimax Search** - Simulates future moves to find optimal play
- **Alpha-Beta Pruning** - Efficiently explores the most promising moves
- **Iterative Deepening** - Balances time and search depth
- **Move Ordering** - Optimizes pruning effectiveness

### Tactical Awareness

- **Capture Opportunities** - Identifies and executes valuable captures
- **Positional Control** - Values center and tactical positions
- **Defensive Play** - Maintains defensive formations when appropriate
- **Wind Spirit Tactics** - Leverages wind spirit mechanics effectively

### Advanced Evaluation

- **Win/Loss Detection** - Immediate recognition of game-ending positions
- **Master Positioning** - Strategic advancement toward opponent's temple
- **Piece Coordination** - Considers piece protection and coordination
- **Card Efficiency** - Evaluates card advantage and optimal usage

## 🔍 Performance Optimizations

### Alpha-Beta Pruning

- Dramatically reduces the number of positions evaluated
- Maintains the same optimal move selection
- Improves search depth within time limits

### Move Ordering

- Sorts moves by heuristic before search
- Improves pruning efficiency
- Better move quality in limited time

### Time Management

- Iterative deepening ensures best move within time limit
- Graceful degradation when time runs out
- Consistent move quality across different positions

## 🔍 Troubleshooting

### Performance Issues

1. Reduce AI difficulty level
2. Check browser performance in dev tools
3. Monitor memory usage

### AI Behavior Issues

1. AI makes predictable moves - Increase difficulty randomness
2. AI seems too weak - Check difficulty level
3. AI doesn't use wind spirits - Verify wind spirit card pack is selected

## 🚀 Future Enhancements

### Planned Features

- [ ] Transposition table for position caching
- [ ] Opening book integration
- [ ] AI move hints for human players
- [ ] Game replay with AI analysis
- [ ] Custom AI difficulty settings
- [ ] AI vs AI tournament mode
- [ ] Learning AI that adapts to player style

### Technical Improvements

- [ ] WebWorker implementation for non-blocking AI
- [ ] Advanced move generation optimization
- [ ] Machine learning integration
- [ ] Real-time AI strength adjustment

## 📚 Resources

- [Minimax Algorithm](https://en.wikipedia.org/wiki/Minimax)
- [Alpha-Beta Pruning](https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning)
- [Onitama Game Rules](https://boardgamegeek.com/boardgame/160477/onitama)
- [Chess Programming Wiki](https://www.chessprogramming.org/)

## 🤝 Contributing

To contribute to the AI integration:

1. Fork the repository
2. Create a feature branch
3. Implement improvements to the Minimax algorithm
4. Test with different card packs
5. Submit a pull request

## 📄 License

The AI integration is part of the main project and follows the same license.
