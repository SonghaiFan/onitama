"use client";
import { MoveCard } from "@/types/game";
import React from "react";

export function getArtName(card: MoveCard) {
  return (
    <span
      className={`
        zen-text font-medium
        text-5xl sm:text-6xl lg:text-7xl
        leading-none
        ${
          String(card.displayName || card.name).length > 2
            ? "scale-90 sm:scale-95"
            : ""
        }
        inline-block
      `}
      style={{
        fontFamily: "DuanNing",
        display: "inline-block",
      }}
    >
      {String(card.displayName || card.name).length > 1 ? (
        <span className="flex flex-col items-center justify-center text-3xl sm:text-4xl lg:text-5xl">
          {String(card.displayName || card.name)
            .split("")
            .map((char, idx, arr) =>
              arr.length === 3 ? (
                <React.Fragment key={idx}>
                  {/* Top center */}
                  <span
                    className="block text-center"
                    style={{
                      marginBottom: "-0.15em",
                    }}
                  >
                    {arr[0]}
                  </span>
                  {/* Bottom left and right */}
                  <span className="flex flex-row justify-center items-start gap-1">
                    <span
                      className="inline-block"
                      style={{
                        marginRight: "0.2em",
                        transform: "translateY(0.15em)",
                      }}
                    >
                      {arr[1]}
                    </span>
                    <span
                      className="inline-block"
                      style={{
                        marginLeft: "0.2em",
                        transform: "translateY(0.15em)",
                      }}
                    >
                      {arr[2]}
                    </span>
                  </span>
                </React.Fragment>
              ) : (
                <span
                  key={idx}
                  className="inline-block"
                  style={{
                    // Fallback to original vertical stagger for other lengths
                    transform:
                      arr.length > 3
                        ? `translateY(${(idx % 2 === 0 ? 10 : -10) * 0.9}%)`
                        : arr.length === 2
                        ? idx === 0
                          ? "translateY(7%)"
                          : "translateY(-7%)"
                        : "",
                    marginTop:
                      arr.length > 1 && idx !== 0 ? "-0.1em" : undefined,
                    marginBottom:
                      arr.length > 1 && idx !== arr.length - 1
                        ? "-0.1em"
                        : undefined,
                  }}
                >
                  {char}
                </span>
              )
            )}
        </span>
      ) : (
        <span>{String(card.displayName || card.name)}</span>
      )}
    </span>
  );
}
