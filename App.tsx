import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './src/components/Header';
import { AnalysisDisplay } from './src/components/AnalysisDisplay';
import { analyzeDesignSystem } from './src/services/geminiService';
import type { AnalysisResult } from './src/types';


const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAnalyze = useCallback(async () => {
    if (!url || !url.startsWith('http')) {
      setError("Por favor, insira uma URL válida para analisar.");
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
      const result = await analyzeDesignSystem(url);
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
            setError('Ocorreu um erro ao analisar o site. Verifique o console para mais detalhes.');
        }
      } else {
        setError('Ocorreu um erro desconhecido.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, isApiKeyReady, isAiStudio]);


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
            Cole a URL de um site para analisá-lo com IA.
          </p>
          <div className="w-full max-w-2xl p-6 bg-brand-secondary/50 rounded-lg border border-slate-600 shadow-xl flex flex-col items-center gap-6">
            <div className="w-full">
              <label htmlFor="url-input" className="block mb-2 text-sm font-medium text-slate-300">Cole a URL do site para analisar</label>
              <input
                  id="url-input"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full p-3 bg-brand-primary border border-slate-600 rounded-md text-brand-light placeholder-slate-400 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-shadow"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!url || isLoading}
              className="w-full md:w-1/2 flex items-center justify-center gap-2 bg-brand-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-500 transition-all duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
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