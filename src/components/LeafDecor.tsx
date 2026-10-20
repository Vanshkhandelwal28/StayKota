import React from 'react';

/** Soft botanical accent on the left — CSS/SVG only (no WebGL dependency). */
export function LeafDecor() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 w-28 sm:w-36 lg:w-44 hidden md:block overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute left-[-1.5rem] top-[8%] w-40 h-56 text-[#9BB8A8]/55 leaf-sway-a"
        viewBox="0 0 120 180"
        fill="none"
      >
        <path
          d="M60 170 C20 130 10 80 30 40 C45 20 70 15 90 35 C105 55 100 110 60 170 Z"
          fill="currentColor"
        />
        <path
          d="M60 170 C48 120 45 70 55 40"
          stroke="#6B8F7A"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
      <svg
        className="absolute left-2 top-[28%] w-32 h-48 text-[#8AAF9A]/45 leaf-sway-b"
        viewBox="0 0 120 180"
        fill="none"
      >
        <path
          d="M50 175 C15 130 5 75 25 35 C40 12 72 10 92 32 C108 52 100 105 50 175 Z"
          fill="currentColor"
        />
        <path
          d="M50 175 C42 125 40 70 52 35"
          stroke="#5F8570"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>
      <svg
        className="absolute left-[-0.5rem] top-[52%] w-36 h-52 text-[#A3BFAF]/40 leaf-sway-c"
        viewBox="0 0 120 180"
        fill="none"
      >
        <path
          d="M55 168 C18 125 12 70 32 30 C48 8 78 12 95 38 C110 60 98 112 55 168 Z"
          fill="currentColor"
        />
        <path
          d="M55 168 C46 118 48 65 58 32"
          stroke="#6B8F7A"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <svg
        className="absolute left-4 bottom-[8%] w-28 h-40 text-[#90B0A0]/35 leaf-sway-a"
        viewBox="0 0 120 180"
        fill="none"
        style={{ animationDelay: '1.2s' }}
      >
        <path
          d="M58 165 C22 120 18 70 40 32 C55 12 80 18 95 40 C108 60 100 105 58 165 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
