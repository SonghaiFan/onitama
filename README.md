# Onitama Game

A modern implementation of the Onitama board game built with Next.js, React, TypeScript, and Framer Motion. Features an intuitive dual-button drag-and-drop system for piece movement.

## 🎮 Game Features

- **Dual Drag System**: Left-click drag uses the left move card, right-click drag uses the right move card
- **Visual Feedback**: Real-time possible moves display with color-coded indicators
- **Smooth Animations**: Framer Motion powered transitions and hover effects
- **Responsive Design**: Modern UI with watercolor textures and zen aesthetics
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Dual Drag-and-Drop System

### Overview

The game implements a sophisticated dual-button drag-and-drop system that allows players to use different move cards based on which mouse button they use:

- **Left Mouse Button**: Uses the left move card (index 0)
- **Right Mouse Button**: Uses the right move card (index 1)

### Technical Implementation

#### 1. Component Architecture

```
src/components/
├── GameBoard.tsx      # Main board with drag logic
├── GamePiece.tsx      # Draggable pieces and cells
├── MoveCards.tsx      # Move card display
└── OnitamaGame.tsx    # Game state management
```

#### 2. Left-Click Drag (Standard @dnd-kit)

- Uses `@dnd-kit/core`'s `PointerSensor` for standard drag-and-drop
- Automatically handles drag start, move, and end events
- Integrates with the existing game logic seamlessly

#### 3. Right-Click Drag (Custom Implementation)

- **Context Menu Prevention**: Prevents browser context menu on right-click
- **Custom Event Handling**: Uses `onMouseDown`, `onMouseMove`, and `onMouseUp` events
- **Mocked Drag State**: Simulates drag state for visual consistency
- **Drop Detection**: Uses `document.elementFromPoint()` to find target cells

#### 4. Key Features

**Visual Feedback:**

- Pieces become semi-transparent during drag
- Possible moves show as colored indicators (blue for left card, purple for right card)
- Card number badges appear on dragged pieces
- Drag overlay follows the mouse cursor

**State Management:**

- `draggedPieceData`: Tracks current drag state
- `isRightDragging`: Distinguishes between left and right drags
- `rightDragPosition`: Tracks mouse position for overlay
- `possibleMoves`: Calculated based on current drag type

**Event Flow:**

```
Right-Click Start → Set Drag State → Mouse Move → Update Position → Mouse Up → Validate Drop → Execute Move
```

#### 5. Code Structure

**GameBoard.tsx - Core Logic:**

```typescript
// State for dual drag system
const [draggedPieceData, setDraggedPieceData] =
  useState<DraggedPieceData | null>(null);
const [isRightDragging, setIsRightDragging] = useState(false);
const [rightDragPosition, setRightDragPosition] = useState<{
  x: number;
  y: number;
} | null>(null);

// Right-click drag handlers
const handleRightMouseDown = useCallback(
  (e: React.MouseEvent, piece: Piece, position: [number, number]) => {
    if (e.button === 2) {
      e.preventDefault();
      // Mock drag state for right-click
      setDraggedPieceData({ position, piece, cardIndex: 1 });
      setIsRightDragging(true);
    }
  },
  [gameState]
);

// Global event listeners for right-click drag
useEffect(() => {
  if (isRightDragging) {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }
}, [isRightDragging, handleMouseMove, handleMouseUp]);
```

**GamePiece.tsx - Component Logic:**

```typescript
// Draggable piece with dual-button support
export function DraggablePiece({ piece, onRightMouseDown, ...props }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: piece.id,
    data: { row, col, piece },
  });

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={(e) => {
        if (e.button === 2 && onRightMouseDown) {
          onRightMouseDown(e, piece, [row, col]);
        }
      }}
    >
      {/* Piece content */}
    </motion.div>
  );
}
```

#### 6. Drop Detection Logic

**Left-Click (Standard):**

```typescript
const handleDragEnd = useCallback(
  (event: DragEndEvent) => {
    const { over } = event;
    if (over && over.id.startsWith("cell-")) {
      const [_, row, col] = over.id.split("-");
      // Validate and execute move
    }
  },
  [draggedPieceData, possibleMoves, onPieceMove]
);
```

**Right-Click (Custom):**

```typescript
const handleMouseUp = useCallback(
  (e: MouseEvent) => {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const cellElement = element?.closest('[data-cell-id^="cell-"]');
    if (cellElement) {
      const cellId = cellElement.getAttribute("data-cell-id");
      const [_, row, col] = cellId?.split("-") || [];
      // Validate and execute move
    }
  },
  [isRightDragging, rightDragStart, gameState, onPieceMove]
);
```

### Benefits of This Approach

1. **Intuitive UX**: Players can naturally use different mouse buttons for different cards
2. **Visual Consistency**: Both drag types provide the same visual feedback
3. **Performance**: Leverages existing @dnd-kit infrastructure for left-click
4. **Maintainability**: Clean separation between standard and custom drag logic
5. **Accessibility**: Maintains keyboard navigation and screen reader support

### Future Enhancements

- Touch gesture support for mobile devices
- Haptic feedback for drag interactions
- Custom drag cursors for different card types
- Drag preview with move path visualization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Drag & Drop**: @dnd-kit/core for left-click, custom implementation for right-click
- **Animations**: Framer Motion
- **State Management**: React hooks (useState, useCallback, useEffect)

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── GameBoard.tsx   # Main game board with drag logic
│   ├── GamePiece.tsx   # Piece and cell components
│   ├── MoveCards.tsx   # Move card display
│   └── OnitamaGame.tsx # Game state management
├── types/              # TypeScript type definitions
│   └── game.ts         # Game state and piece interfaces
└── utils/              # Game logic utilities
    ├── gameLogic.ts    # Core game rules and move validation
    └── onitama_16_cards.json # Move card definitions
```

## 🎨 Design System

The game features a minimalist design with:

- Watercolor textures and zen aesthetics
- Smooth animations and transitions
- Color-coded visual feedback
- Responsive layout for different screen sizes

## 🚀 Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
