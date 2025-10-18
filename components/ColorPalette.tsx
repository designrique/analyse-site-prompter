
import React from 'react';
import type { ColorInfo } from '../types';

interface ColorPaletteProps {
  colors: ColorInfo[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colors }) => {
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {colors.map((color) => (
        <div key={color.hex} className="p-4 rounded-lg bg-brand-secondary flex flex-col gap-2">
          <div 
            className="w-full h-20 rounded-md border border-slate-500 cursor-pointer" 
            style={{ backgroundColor: color.hex }}
            onClick={() => copyToClipboard(color.hex)}
            title="Clique para copiar"
          ></div>
          <div className="text-left">
            <p className="font-bold text-slate-200">{color.name}</p>
            <p className="font-mono text-sm text-brand-accent">{color.hex}</p>
            <p className="text-xs text-slate-400 mt-1">{color.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
