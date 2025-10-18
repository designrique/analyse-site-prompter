import React from 'react';
import type { AnalysisResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ResultSection } from './ResultSection';
import { ColorPalette } from './ColorPalette';
import { PromptCard } from './PromptCard';

interface AnalysisDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, isLoading, error }) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="w-full text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
        <h3 className="text-xl font-semibold text-red-300">Erro na Análise</h3>
        <p className="text-red-400 mt-2">{error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <ResultSection title="Avaliação Geral">
        <p className="text-slate-300 leading-relaxed">{result.overallEvaluation}</p>
      </ResultSection>

      <ResultSection title="Paleta de Cores">
        <ColorPalette colors={result.colorPalette} />
      </ResultSection>

      <ResultSection title="Tipografia">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-brand-secondary p-4 rounded-lg">
            <h4 className="font-bold text-lg text-brand-accent">Títulos</h4>
            <p><span className="font-semibold text-slate-300">Família:</span> {result.typography.headings.fontFamily}</p>
            <p><span className="font-semibold text-slate-300">Peso:</span> {result.typography.headings.fontWeight}</p>
            <p className="mt-2 text-sm text-slate-400">{result.typography.headings.description}</p>
          </div>
          <div className="bg-brand-secondary p-4 rounded-lg">
            <h4 className="font-bold text-lg text-brand-accent">Corpo do Texto</h4>
            <p><span className="font-semibold text-slate-300">Família:</span> {result.typography.body.fontFamily}</p>
            <p><span className="font-semibold text-slate-300">Peso:</span> {result.typography.body.fontWeight}</p>
            <p className="mt-2 text-sm text-slate-400">{result.typography.body.description}</p>
          </div>
        </div>
      </ResultSection>

       <ResultSection title="Componentes Principais">
         <div className="space-y-4">
            {result.mainComponents.map((component, index) => (
                 <div key={index} className="bg-brand-secondary p-4 rounded-lg">
                     <h4 className="font-bold text-lg text-brand-accent">{component.name}</h4>
                     <p className="mt-1 text-slate-300">{component.description}</p>
                 </div>
            ))}
         </div>
       </ResultSection>

      <ResultSection title="Prompts para Desenvolvimento (Tailwind CSS)">
        <div className="space-y-4">
          {result.developmentPrompts.map((prompt, index) => (
            <PromptCard key={index} prompt={prompt} />
          ))}
        </div>
      </ResultSection>
    </div>
  );
};
