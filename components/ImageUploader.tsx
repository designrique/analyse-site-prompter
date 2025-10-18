import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onUrlBlur: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
  imageFile: File | null;
  isPreviewLoading: boolean;
  previewError: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onImageChange, 
    url, 
    onUrlChange, 
    onUrlBlur,
    onAnalyze, 
    isLoading, 
    imageFile,
    isPreviewLoading,
    previewError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onImageChange(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full p-6 bg-brand-secondary/50 rounded-lg border border-slate-600 shadow-xl flex flex-col items-center gap-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      <div className="w-full">
        <label htmlFor="url-input" className="block mb-2 text-sm font-medium text-slate-300">URL do Site (Opcional)</label>
        <input
            id="url-input"
            type="text"
            value={url}
            onBlur={onUrlBlur}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Cole a URL para gerar uma pré-visualização automática"
            className="w-full p-3 bg-brand-primary border border-slate-600 rounded-md text-brand-light placeholder-slate-400 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-shadow"
        />
      </div>
      
      <div className="w-full min-h-[200px] bg-brand-primary border border-slate-600 rounded-md flex items-center justify-center p-4">
        {isPreviewLoading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
                <svg className="animate-spin h-8 w-8 text-brand-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Carregando pré-visualização...</span>
            </div>
        ) : previewError ? (
             <div className="text-center text-red-400">
                <p>{previewError}</p>
            </div>
        ) : imageFile ? (
            <img 
                src={URL.createObjectURL(imageFile)} 
                alt="Pré-visualização do site" 
                className="max-w-full max-h-56 object-contain rounded-md"
            />
        ) : (
            <div className="text-center text-slate-400">
                <p>A pré-visualização do site aparecerá aqui.</p>
                <p className="text-sm">Insira uma URL ou selecione um arquivo.</p>
            </div>
        )}
    </div>


      <div className="w-full">
        <label className="block mb-2 text-sm font-medium text-slate-300">Ou envie uma captura de tela</label>
        <div className="flex items-center gap-4">
             <button 
                type="button" 
                onClick={triggerFileSelect}
                className="px-4 py-2 text-sm font-semibold bg-slate-600 text-brand-light rounded-md hover:bg-slate-500 transition-colors"
            >
                Selecionar Arquivo
            </button>
            <span className="text-sm text-slate-400 truncate">
                {imageFile ? imageFile.name : 'Nenhum arquivo selecionado.'}
            </span>
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={!imageFile || isLoading}
        className="w-full md:w-1/2 flex items-center justify-center gap-2 bg-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 transition-all duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analisando...
          </>
        ) : (
          'Analisar Design System'
        )}
      </button>
    </div>
  );
};