# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Project Architecture

This is a **Next.js 15 Onitama board game** implementation using React 19, TypeScript, and Tailwind CSS v4. Onitama is a two-player abstract strategy game similar to chess but played on a 5×5 board with unique movement cards.

### Core Technologies
- **Next.js 15** with App Router
- **React 19** with hooks and TypeScript
- **Tailwind CSS v4** with custom Zen-style utilities
- **Framer Motion** for smooth animations
- **Zustand** for state management (if needed for global state)

### Game Architecture

#### Game State Structure (`src/types/game.ts`)
- **GameState**: Central game state including board, players, cards, and current turn
- **Player**: Either "red" or "blue" 
- **Piece**: Game pieces with player, master status, and position
- **MoveCard**: Cards containing movement patterns and player associations

#### Game Logic (`src/utils/gameLogic.ts`)
- Contains 16 official Onitama cards loaded from `onitama_16_cards.json`
- **Card Selection**: Randomly selects 5 cards per game (2 per player + 1 shared)
- **Movement System**: Red player moves "forward" (negative y), Blue moves "backward" (positive y)
- **Win Conditions**: Way of the Stone (capture Master) or Way of the Stream (Master reaches opponent's Temple Arch)
- **Card Rotation**: Used cards are rotated 180° and become available to the opponent

#### Component Structure
- **OnitamaGame** (`src/components/OnitamaGame.tsx`): Main game orchestration component with piece/card selection logic
- **GameBoard** (`src/components/GameBoard.tsx`): 5×5 board rendering with piece interactions
- **GameStatus** (`src/components/GameStatus.tsx`): Current player indicator and win state
- **MoveCards** (`src/components/MoveCards.tsx`): Card display with movement patterns
- **OnitamaLanding** (`src/components/OnitamaLanding.tsx`): Landing page component

#### Styling Approach
- **Zen-style Design**: Custom CSS classes in `globals.css` with scroll textures, neoprene mat effects, and temple arch styling
- **Motion Integration**: Framer Motion animations for smooth card transitions and piece movements
- **Responsive Layout**: Cards positioned absolutely around the central game board

### Key Game Mechanics

#### Turn Flow
1. Player selects a piece and a movement card
2. Player moves according to the card's pattern
3. Used card rotates 180° and becomes the new shared card
4. Player takes the previous shared card
5. Turn passes to opponent

#### Coordinate System
- Board uses `[row, col]` coordinates (0-4 for both)
- Temple Archs: Red at `[4,2]` (bottom center), Blue at `[0,2]` (top center)
- Card moves are relative to piece position with y-direction inverted for blue player

#### Card Data Format
Cards are defined in JSON with:
- `moves`: Array of `{x, y}` offsets from current position
- `firstPlayerColor`: Determines which player can use this card to start the game
- Display uses 5×5 grid with center at `[2,2]` representing the piece's current position

### Development Notes

- The game uses imperative handles for game reset functionality
- State management is primarily local with React hooks
- Card positioning uses absolute positioning with Framer Motion animations
- All text is localized in Chinese for the UI
- Game board has temple arch highlighting and neoprene mat styling