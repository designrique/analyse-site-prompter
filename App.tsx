
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeDesignSystem } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // remove data:image/jpeg;base64, prefix
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeDesignSystem(base64Image, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar a imagem. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <p className="text-center text-slate-300 text-lg">
            Faça upload da captura de tela de um site para analisá-lo com IA.
          </p>
          <ImageUploader 
            onImageChange={handleImageChange}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          <AnalysisDisplay 
            result={analysisResult}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500">
        <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
