import React from 'react';

const LogoIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-8 w-8 text-brand-accent"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="9" y1="21" x2="9" y2="9"></line>
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="py-6 bg-brand-primary/80 backdrop-blur-sm border-b border-brand-secondary">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4">
        <LogoIcon />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-light">
          Analisador de Design System com IA
        </h1>
      </div>
    </header>
  );
};
