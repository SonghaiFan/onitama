# 🏗️ Onitama Game Architecture

## Overview

This document describes the modern, clean architecture of the Onitama game, implemented with React 19, TypeScript, and Next.js 15.

## 🎯 Architecture Principles

### **1. Single Source of Truth**

All game state is managed centrally through the Game Controller, eliminating scattered state and ensuring consistency.

### **2. Separation of Concerns**

- **UI Components**: Handle presentation and user interaction
- **Game Controller**: Manages game logic and state transitions
- **AI Service**: Handles AI opponents and difficulty levels
- **Event Bus**: Enables loose coupling between components
- **Persistence Layer**: Manages data storage and retrieval

### **3. Reactive Architecture**

Components automatically update when game state changes through React Context and custom hooks.

## 🏗️ Core Components

### **Game Controller** (`src/utils/gameController.ts`)

```typescript
class GameController {
  // Centralized game state management
  // AI integration and management
  // Move validation and execution
  // Event coordination
}
```

**Responsibilities:**

- ✅ Centralized game state management
- ✅ AI player coordination and move execution
- ✅ Move validation and game rules enforcement
- ✅ Event publishing and state synchronization

### **React Hook Interface** (`src/hooks/useGameController.ts`)

```typescript
const {
  gameState,
  isLoading,
  isAITurn,
  aiPlayer,
  selectPiece,
  selectCard,
  executeMove,
  setAIPlayer,
  resetGame,
} = useGameController();
```

**Benefits:**

- ✅ Type-safe API
- ✅ Automatic state subscriptions
- ✅ Memoized callbacks for performance
- ✅ React lifecycle integration

### **Context Provider** (`src/contexts/GameContext.tsx`)

```typescript
<GameProvider>
  <OnitamaGame />
</GameProvider>
```

**Features:**

- ✅ Eliminates prop drilling
- ✅ Global state access
- ✅ Clean component interfaces
- ✅ Better component reusability

### **Event Bus** (`src/utils/eventBus.ts`)

```typescript
// Publish events
gameEventBus.publish(GameEvents.PIECE_SELECTED, { position });

// Subscribe to events
gameEventBus.subscribe(GameEvents.MOVE_EXECUTED, handleMove);
```

**Benefits:**

- ✅ Loose coupling between components
- ✅ Extensible architecture
- ✅ Easy debugging and logging
- ✅ Event-driven interactions

## 🤖 AI Integration

### **AI Service** (`src/utils/aiService.ts`)

- **2 Difficulty Levels**: Easy, Medium
- **Thinking Simulation**: Realistic AI behavior with configurable timing
- **Move Evaluation**: Advanced algorithms for strategic gameplay
- **Configuration**: Adjustable randomness and response time

### **AI Configuration** (`src/components/ui/AIConfigPanel.tsx`)

- Simple, clean interface for AI settings
- Player selection (Red AI, Blue AI, Human vs Human)
- Difficulty level configuration
- Real-time configuration changes

## 📊 Data Flow

```
User Interaction
       ↓
  UI Components
       ↓
   useGame Hook
       ↓
  Game Controller ←→ AI Service
       ↓
   Game State
       ↓
  Context Provider
       ↓
  Component Updates
```

## 🎮 Component Structure

### **Landing Page** (`src/components/OnitamaLanding.tsx`)

- Card pack selection
- Game configuration
- Language switching
- Navigation to game

### **Game Component** (`src/components/OnitamaGame.tsx`)

- Game board rendering
- AI settings panel
- Player interaction handling
- Game status display

### **UI Components** (`src/components/ui/`)

- **AIConfigPanel**: AI configuration interface
- **AIThinkingIndicator**: Visual feedback during AI turns
- **ZenButton**: Styled button component

## 🚀 Performance Optimizations

### **Efficient State Management**

- Single state tree eliminates unnecessary re-renders
- Context-based updates only affect subscribed components
- Memoized callbacks prevent function recreation

### **Optimized Re-renders**

- React.memo for expensive components
- Selective component updates based on state changes
- Event-driven architecture reduces coupling

### **AI Performance**

- Asynchronous AI move calculation
- Configurable thinking time simulation
- Efficient move evaluation algorithms

## 🧪 Testing Strategy

### **Testable Architecture**

- Isolated game logic in controller
- Mockable AI service
- Pure functions for game rules
- Event bus for integration testing

### **Testing Layers**

- **Unit Tests**: Game controller, AI service, utilities
- **Integration Tests**: Component interactions, event flow
- **E2E Tests**: Complete gameplay scenarios

## 📈 Scalability

### **Extensibility**

- Plugin architecture ready for new game modes
- Event system supports new features
- Modular AI service for different strategies
- Configurable game rules and card packs

### **Future Enhancements**

- **Multiplayer Support**: Network layer integration
- **Tournament Mode**: AI vs AI competitions
- **Analytics**: Game statistics and insights
- **Custom Rules**: Mod support and custom card packs

## 🎯 Benefits Summary

### **For Developers**

- **Maintainability**: Clean, organized code structure
- **Debugging**: Clear data flow and error tracking
- **Extensibility**: Easy to add new features
- **Testing**: Isolated, mockable components

### **For Users**

- **Performance**: Fast, responsive gameplay
- **Reliability**: Stable, bug-free AI functionality
- **Features**: Rich AI opponents with multiple difficulty levels
- **Experience**: Smooth, intuitive interface

### **For the Project**

- **Future-Proof**: Scalable architecture for growth
- **Standards**: Modern React/TypeScript best practices
- **Documentation**: Clear, comprehensive architecture docs
- **Community**: Easy for contributors to understand

This architecture provides a solid foundation for the Onitama game's continued development while maintaining excellent performance and user experience.
