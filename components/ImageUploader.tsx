import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, url, onUrlChange, onAnalyze, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
    onImageChange(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0] || null;
     if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageChange(file);
     }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
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

      <label
        className={`w-full h-64 border-2 border-dashed border-slate-500 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-brand-accent transition-colors duration-300 ${previewUrl ? 'p-2' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileSelect}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p className="mt-2 text-slate-300">Arraste e solte uma imagem ou clique para selecionar</p>
            <p className="text-xs text-slate-400">PNG, JPG ou WEBP</p>
          </div>
        )}
      </label>

      <div className="w-full">
        <label htmlFor="url-input" className="sr-only">URL do Site</label>
        <input
            id="url-input"
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Opcional: cole a URL do site analisado aqui"
            className="w-full p-3 bg-brand-primary border border-slate-600 rounded-md text-brand-light placeholder-slate-400 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-shadow"
        />
      </div>


      <button
        onClick={onAnalyze}
        disabled={!previewUrl || isLoading}
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