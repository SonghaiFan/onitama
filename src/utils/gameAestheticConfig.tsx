/**
 * Centralized game aesthetic configuration for Onitama
 * Contains symbols and Tailwind class mappings - colors defined in globals.css
 */

"use client";

import React from "react";
import Image from "next/image";

// ==========================================================================
// THEME CONFIGURATION
// ==========================================================================

export const gameColors = {
  red: {
    tailwind: {
      primary: "bg-red-600",
      text: "text-red-600",
      shadow: "shadow-red-300",
      gradient: "from-red-400/50",
      gradientLight: "from-red-400/10",
    },
  },
  blue: {
    tailwind: {
      primary: "bg-blue-600",
      text: "text-blue-600",
      shadow: "shadow-blue-300",
      gradient: "from-blue-400/50",
      gradientLight: "from-blue-400/10",
    },
  },
  neutral: {
    tailwind: {
      primary: "bg-gray-100",
      text: "text-gray-700",
      shadow: "shadow-gray-200",
      gradient: "from-gray-100/50",
      gradientLight: "from-gray-100/10",
    },
  },
} as const;

export const getPlayerColors = (player: "red" | "blue" | "neutral") =>
  gameColors[player];

// ==========================================================================
// SYMBOLS CONFIGURATION
// ==========================================================================

export const GAME_SVG_ICONS = {
  WIND_SPIRIT: "/symbol/wind-spirit.svg",
  MASTER: "/symbol/master.svg",
  STUDENT: "/symbol/student.svg",
} as const;

interface PieceProps {
  isWindSpirit?: boolean;
  isMaster?: boolean;
  player?: string;
}

export const getPieceSymbol = (piece: PieceProps): string => {
  if (piece.isWindSpirit) return GAME_SVG_ICONS.WIND_SPIRIT;
  if (piece.isMaster) return GAME_SVG_ICONS.MASTER;
  return GAME_SVG_ICONS.STUDENT;
};

export const getPieceStyleClass = (piece: PieceProps): string => {
  const typeClass = piece.isWindSpirit
    ? "wind-spirit-piece"
    : piece.isMaster
    ? "master-piece"
    : "student-piece";

  const colorClass =
    piece.player === "red"
      ? "red-piece"
      : piece.player === "blue"
      ? "blue-piece"
      : "neutral-piece";

  return `${typeClass} ${colorClass}`;
};

// ==========================================================================
// SYMBOL COMPONENTS
// ==========================================================================

interface GameSymbolProps {
  type: "wind-spirit" | "master" | "student";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  player?: "red" | "blue";
}

const SIZE_CLASSES = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
} as const;

export const GameSymbol = ({
  type,
  className = "",
  size = "md",
  player,
}: GameSymbolProps) => {
  const svgPath =
    type === "wind-spirit"
      ? GAME_SVG_ICONS.WIND_SPIRIT
      : type === "master"
      ? GAME_SVG_ICONS.MASTER
      : GAME_SVG_ICONS.STUDENT;

  return (
    <Image
      src={svgPath}
      alt={type}
      width={32}
      height={32}
      className={`inline-block ${SIZE_CLASSES[size]} ${className} ${
        player === "blue" ? "rotate-180" : ""
      } object-contain max-w-full max-h-full`}
    />
  );
};

// Convenience components
export const WindSpiritSymbol = (props: Omit<GameSymbolProps, "type">) => (
  <GameSymbol type="wind-spirit" {...props} />
);

export const MasterSymbol = (props: Omit<GameSymbolProps, "type">) => (
  <GameSymbol type="master" {...props} />
);

export const StudentSymbol = (props: Omit<GameSymbolProps, "type">) => (
  <GameSymbol type="student" {...props} />
);