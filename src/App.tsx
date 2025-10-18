import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeDesignSystem } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // State to determine the environment and API key status
  const [isApiKeyReady, setIsApiKeyReady] = useState<boolean>(false);
  const [isAiStudio, setIsAiStudio] = useState<boolean>(false);
  const [isCheckingEnv, setIsCheckingEnv] = useState<boolean>(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      // Check if running in an environment with aistudio (like AI Studio)
      const studioEnv = !!(window as any).aistudio;
      setIsAiStudio(studioEnv);

      if (studioEnv) {
        // In AI Studio, we must check if a key has been selected by the user.
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeyReady(hasKey);
      } else {
        // In other environments (like Netlify), the API key is expected
        // to be in the environment variables, so we can proceed.
        setIsApiKeyReady(true);
      }
      setIsCheckingEnv(false);
    };

    checkEnvironment();
  }, []);


  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setAnalysisResult(null);
    setError(null);
    setPreviewError(null); // Clear preview error on manual selection
  };

  const handleUrlBlur = async () => {
    if (!url || !url.startsWith('http')) {
        return;
    }

    setIsPreviewLoading(true);
    setPreviewError(null);
    if(imageFile) handleImageChange(null); // Clear previous image only if it exists

    try {
        // Use a CORS proxy to fetch the website's HTML
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch website HTML.');
        }
        const html = await response.text();

        // Parse the HTML to find the og:image meta tag
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const ogImageContent = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');

        if (!ogImageContent) {
            throw new Error('Meta tag "og:image" not found.');
        }

        // The og:image URL might be relative, so resolve it against the base URL
        const ogImageUrl = new URL(ogImageContent, url).href;

        // Fetch the image itself (also through a proxy to be safe)
        const imageResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(ogImageUrl)}`);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch the OG image.');
        }
        const imageBlob = await imageResponse.blob();

        // Create a File object and set it in the state
        const imageFileName = ogImageUrl.split('/').pop()?.split('?')[0] || 'og-preview.png';
        const imageFile = new File([imageBlob], imageFileName, { type: imageBlob.type });
        
        handleImageChange(imageFile);

    } catch (err) {
        console.error("OG Image fetch error:", err);
        setPreviewError('Não foi possível carregar a pré-visualização. Por favor, envie uma captura de tela manualmente.');
    } finally {
        setIsPreviewLoading(false);
    }
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

    if (!isApiKeyReady) {
      setError('Por favor, selecione uma chave de API para começar.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeDesignSystem(base64Image, imageFile.type, url);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.includes('API key not valid') || err.message.includes('entity was not found')) {
            if (isAiStudio) {
                setError('A chave de API selecionada é inválida. Por favor, selecione uma chave de API válida e tente novamente.');
                setIsApiKeyReady(false); // Reset key state to re-trigger selection in AI Studio
            } else {
                setError('A chave de API configurada no ambiente de hospedagem é inválida. Verifique suas variáveis de ambiente.');
            }
        } else if (err.message.includes('API key not found')) {
            setError('A chave de API não foi configurada corretamente no ambiente de hospedagem. Verifique as variáveis de ambiente.');
        } else {
            setError('Ocorreu um erro ao analisar a imagem. Verifique o console para mais detalhes.');
        }
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, isApiKeyReady, isAiStudio, url]);

  const handleSelectApiKey = async () => {
    if (isAiStudio) {
      await (window as any).aistudio.openSelectKey();
      // Assume success to avoid race condition and immediately update UI
      setIsApiKeyReady(true);
      setError(null); // Clear previous errors
    }
  };
  
  // Display a loading indicator while checking the environment.
  if (isCheckingEnv) {
    return (
      <div className="min-h-screen bg-brand-primary font-sans flex items-center justify-center">
          <p className="text-slate-300 text-lg">Inicializando...</p>
      </div>
    );
  }

  // If the key isn't ready (which should only happen in AI Studio), show the selection screen.
  if (!isApiKeyReady) {
    return (
      <div className="min-h-screen bg-brand-primary font-sans flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center text-center p-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-brand-light mb-4">Selecione uma chave de API para começar</h2>
            <p className="text-slate-300 mb-6">
              Para usar este aplicativo, você precisa selecionar uma chave de API do Google AI.
              Para mais informações sobre cobrança, visite <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-accent underline hover:text-teal-400">a documentação oficial</a>.
            </p>
            <button
              onClick={handleSelectApiKey}
              className="bg-brand-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-all duration-300 transform hover:scale-105"
            >
              Selecionar Chave de API
            </button>
             {error && (
                <div className="mt-4 text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-300">{error}</p>
                </div>
            )}
          </div>
        </main>
        <footer className="text-center py-6 text-slate-500">
          <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-primary font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          <p className="text-center text-slate-300 text-lg">
            Forneça a captura de tela de um site para analisá-lo com IA.
          </p>
          <ImageUploader 
            onImageChange={handleImageChange}
            url={url}
            onUrlChange={setUrl}
            onUrlBlur={handleUrlBlur}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            imageFile={imageFile}
            isPreviewLoading={isPreviewLoading}
            previewError={previewError}
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