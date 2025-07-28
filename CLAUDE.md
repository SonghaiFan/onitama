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
- **Framer Motion** (`motion` package) for smooth animations
- **@use-gesture/react** for touch and gesture handling
- **Zustand** for state management (available but not currently used)

### Game Architecture

#### Game State Structure (`src/types/game.ts`)

- **GameState**: Central game state including board, players, cards, current turn, and wind spirit position
- **Player**: Either "red" or "blue" (pieces can also be "neutral" for wind spirit)
- **Piece**: Game pieces with player, master status, position, and optional wind spirit properties
- **MoveCard**: Cards containing movement patterns, player associations, and optional wind moves

#### Game Logic (`src/utils/gameLogic.ts`)

- **Multiple Card Packs**: Supports three card packs with 16 cards each:
  - `onitama_cards_normal.json` - Standard Onitama cards
  - `onitama_cards_senseis.json` - Sensei's Path expansion
  - `onitama_cards_windway.json` - Wind Spirit expansion with wind mechanics
- **Card Selection**: Randomly selects 5 cards per game (2 per player + 1 shared)
- **Movement System**: Red player moves "forward" (negative y), Blue moves "backward" (positive y)
- **Wind Spirit Mechanics**: Special cards with `wind_move` properties for enhanced gameplay
- **Win Conditions**: Way of the Stone (capture Master) or Way of the Stream (Master reaches opponent's Temple Arch)
- **Card Rotation**: Used cards are rotated 180° and become available to the opponent

#### Component Structure

- **OnitamaLanding** (`src/components/OnitamaLanding.tsx`): Landing page with card pack selection and game rules
- **OnitamaGame** (`src/components/OnitamaGame.tsx`): Main game orchestration component with piece/card selection logic
- **GameBoard** (`src/components/GameBoard.tsx`): 5×5 board rendering with drag-and-drop piece interactions
- **GameCell** (`src/components/GameCell.tsx`): Individual board cells with drop zones and touch handling
- **GamePiece** (`src/components/GamePiece.tsx`): Draggable pieces with visual feedback and gesture support
- **MoveCards** (`src/components/MoveCards.tsx`): Card display with movement patterns and wind move grids

#### Styling Approach

- **Zen-style Design**: Custom CSS classes in `globals.css` with scroll textures, neoprene mat effects, and temple arch styling
- **Traditional Aesthetics**: Chinese/Japanese font stacks and traditional visual elements
- **Motion Integration**: Framer Motion animations for smooth card transitions and piece movements
- **Responsive Layout**: Cards positioned absolutely around the central game board with mobile touch support

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
- `wind_move`: Optional array for Wind Spirit cards with additional movement patterns
- `firstPlayerColor`: Determines which player can use this card to start the game
- `name`: Multilingual object with `en`, `zh`, and `ja` translations
- Display uses 5×5 grid with center at `[2,2]` representing the piece's current position

#### Card Pack Structure

Three card packs are available in `/public/pack/`:

- **Normal Pack**: Standard 16-card Onitama set
- **Sensei's Path**: Advanced expansion cards
- **Wind Spirit**: Cards with wind mechanics and dual movement grids

### Development Notes

#### State Management

- The game uses imperative handles for game reset functionality via `forwardRef`
- State management is primarily local with React hooks (no global store currently used)
- Game state is centralized in the `OnitamaGame` component and passed down via props

#### Interaction Model

- **Desktop**: Drag-and-drop interface for piece movement
- **Mobile**: Touch gestures with `@use-gesture/react` for mobile-friendly interaction
- **Card Selection**: Click/tap to select cards and view movement patterns

#### Internationalization

- All text content supports Chinese, English, and Japanese
- UI is primarily displayed in Chinese with bilingual card names
- Card pack metadata includes multilingual descriptions

#### File Structure

- Card data stored as JSON files in `/public/pack/`
- Custom fonts located in `/public/fonts/`
- Game logic separated into utility functions in `/src/utils/`
- TypeScript interfaces centralized in `/src/types/`
