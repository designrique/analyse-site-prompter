import React, { useState } from 'react';

interface PromptCardProps {
  prompt: string;
}

const CopyIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);


export const PromptCard: React.FC<PromptCardProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-brand-secondary p-4 rounded-lg flex items-start gap-4 border border-slate-700">
      <div className="flex-shrink-0 text-brand-accent pt-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="flex-grow text-slate-300">{prompt}</p>
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 p-2 rounded-md transition-colors duration-200 ${copied ? 'bg-green-500' : 'bg-slate-600 hover:bg-slate-500'}`}
        title={copied ? 'Copiado!' : 'Copiar prompt'}
      >
        {copied ? (
            <CheckIcon className="h-5 w-5 text-white" />
        ) : (
            <CopyIcon className="h-5 w-5 text-slate-200" />
        )}
      </button>
    </div>
  );
};
