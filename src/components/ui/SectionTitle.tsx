import React from "react";

export function SectionTitle({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mr-4">
        <span
          className="text-stone-700 font-light"
          style={{ fontFamily: "DuanNing" }}
        >
          {number}
        </span>
      </div>
      <h3 className="text-3xl font-light text-stone-800 tracking-wide zen-text">
        {title}
      </h3>
    </div>
  );
}
