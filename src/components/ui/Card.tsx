import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'violet' | 'teal' | false;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glow = false, onClick }: CardProps) {
  const glowClass =
    glow === 'violet' ? 'card-glow' :
    glow === 'teal' ? 'card-glow card-glow-teal' :
    hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-slate-100/80 bg-white shadow-sm
        ${glowClass}
        ${className}`}
    >
      {children}
    </div>
  );
}
