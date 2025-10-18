import React from 'react';

interface ResultSectionProps {
  title: string;
  children: React.ReactNode;
}

export const ResultSection: React.FC<ResultSectionProps> = ({ title, children }) => {
  return (
    <section className="w-full p-6 bg-brand-secondary/50 rounded-lg border border-slate-700 shadow-xl">
      <h3 className="text-2xl font-bold mb-4 text-brand-light border-b-2 border-brand-accent pb-2">
        {title}
      </h3>
      {children}
    </section>
  );
};
