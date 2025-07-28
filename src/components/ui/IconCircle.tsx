import React from "react";

// Reusable components

export function IconCircle({
  children,
  size = "w-16 h-16",
  className = "",
}: {
  children: React.ReactNode;
  size?: string;
  className?: string;
}) {
  return (
    <div
      className={`${size} bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 ${className}`}
    >
      <span
        className="text-4xl text-stone-600"
        style={{ fontFamily: "DuanNing" }}
      >
        {children}
      </span>
    </div>
  );
}
