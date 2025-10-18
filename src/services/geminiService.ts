import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallEvaluation: {
      type: Type.STRING,
      description: "Uma avaliação geral concisa do design system, abordando coesão, usabilidade e estética."
    },
    colorPalette: {
      type: Type.ARRAY,
      description: "Uma lista das cores primárias, secundárias e de destaque encontradas no design.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "O nome funcional da cor (ex: Primária, Fundo, Destaque)." },
          hex: { type: Type.STRING, description: "O código hexadecimal da cor (ex: #FFFFFF)." },
          description: { type: Type.STRING, description: "Como a cor é usada no site." },
        },
        required: ["name", "hex", "description"],
      },
    },
    typography: {
      type: Type.OBJECT,
      description: "Análise das fontes utilizadas para títulos e corpo de texto.",
      properties: {
        headings: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "A família da fonte usada para títulos." },
            fontWeight: { type: Type.STRING, description: "O peso da fonte (ex: Bold, 700)." },
            description: { type: Type.STRING, description: "Uma breve descrição do estilo dos títulos." },
          },
          required: ["fontFamily", "fontWeight", "description"],
        },
        body: {
          type: Type.OBJECT,
          properties: {
            fontFamily: { type: Type.STRING, description: "A família da fonte usada para o corpo do texto." },
            fontWeight: { type: Type.STRING, description: "O peso da fonte (ex: Regular, 400)." },
            description: { type: Type.STRING, description: "Uma breve descrição do estilo do corpo de texto." },
          },
          required: ["fontFamily", "fontWeight", "description"],
        },
      },
    },
    mainComponents: {
        type: Type.ARRAY,
        description: "Uma lista dos principais componentes de UI identificados e sua descrição.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "O nome do componente (ex: Botão, Card, Input)." },
                description: { type: Type.STRING, description: "Uma descrição detalhada do estilo e funcionalidade do componente." },
            },
            required: ["name", "description"],
        }
    },
    developmentPrompts: {
      type: Type.ARRAY,
      description: "Uma lista de 3 a 5 prompts práticos para um desenvolvedor usar com uma IA para recriar elementos do site usando Tailwind CSS.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["overallEvaluation", "colorPalette", "typography", "mainComponents", "developmentPrompts"],
};

export const analyzeDesignSystem = async (imageBase64: string, mimeType: string): Promise<AnalysisResult> => {
  // Fix: The API key must be obtained exclusively from `process.env.API_KEY` as per the coding guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';
  
  const prompt = `Você é um especialista em UI/UX e consultor de desenvolvimento frontend. Analise a captura de tela do site fornecida. Avalie seu design system, focando na consistência visual, usabilidade e princípios de design modernos. Forneça uma análise detalhada no formato JSON solicitado. A análise deve ser perspicaz e os prompts de desenvolvimento devem ser práticos e prontos para uso para gerar código com Tailwind CSS.`;

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };
  
  const textPart = {
    text: prompt
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [textPart, imagePart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });
  
  const responseText = response.text.trim();
  try {
    return JSON.parse(responseText) as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse Gemini response:", responseText);
    throw new Error("A resposta da API não estava no formato JSON esperado.");
  }
};
