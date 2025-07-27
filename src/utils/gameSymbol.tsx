"use client";

import React from "react";

// SVG icon paths for game symbols
export const GAME_SVG_ICONS = {
  WIND_SPIRIT: "/symbol/wind-spirit.svg",
  MASTER: "/symbol/master.svg",
  STUDENT: "/symbol/student.svg",
} as const;

// Helper function to get piece symbol (SVG only)
export function getPieceSymbol(piece: {
  isWindSpirit?: boolean;
  isMaster?: boolean;
}): string {
  if (piece.isWindSpirit) {
    return GAME_SVG_ICONS.WIND_SPIRIT;
  } else if (piece.isMaster) {
    return GAME_SVG_ICONS.MASTER;
  } else {
    return GAME_SVG_ICONS.STUDENT;
  }
}

// Helper function to get piece style class
export function getPieceStyleClass(piece: {
  isWindSpirit?: boolean;
  isMaster?: boolean;
  player?: string;
}): string {
  let style = "";

  if (piece.isWindSpirit) {
    style = "wind-spirit-piece";
  } else if (piece.isMaster) {
    style = "master-piece";
  } else {
    style = "student-piece";
  }

  // Add player color
  if (piece.player === "red") {
    style += " red-piece";
  } else if (piece.player === "blue") {
    style += " blue-piece";
  } else {
    style += " neutral-piece";
  }

  return style;
}

// React component for rendering game symbols
interface GameSymbolProps {
  type: "wind-spirit" | "master" | "student";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  player?: "red" | "blue";
}

export function GameSymbol({
  type,
  className = "",
  size = "md",
  player,
}: GameSymbolProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const baseClasses = `inline-block ${sizeClasses[size]} ${className}`;

  const svgPath =
    type === "wind-spirit"
      ? GAME_SVG_ICONS.WIND_SPIRIT
      : type === "master"
      ? GAME_SVG_ICONS.MASTER
      : GAME_SVG_ICONS.STUDENT;

  return (
    <img
      src={svgPath}
      alt={type}
      className={`${baseClasses} ${player === "blue" ? "rotate-180" : ""}`}
    />
  );
}

// Convenience components for each symbol type
export function WindSpiritSymbol(props: Omit<GameSymbolProps, "type">) {
  return <GameSymbol type="wind-spirit" {...props} />;
}

export function MasterSymbol(props: Omit<GameSymbolProps, "type">) {
  return <GameSymbol type="master" {...props} />;
}

export function StudentSymbol(props: Omit<GameSymbolProps, "type">) {
  return <GameSymbol type="student" {...props} />;
}
