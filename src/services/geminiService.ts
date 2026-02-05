import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCreativeBio = async (name: string, keywords: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `Escreva uma biografia curta, criativa e engajadora (máximo 140 caracteres) para um perfil estilo Linktree.
    Nome do usuário: ${name}
    Interesses/Palavras-chave: ${keywords}
    Idioma: Português do Brasil.
    Use emojis se apropriado. Retorne APENAS o texto da biografia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Bio gerada não disponível.";
  } catch (error) {
    console.error("Error generating bio:", error);
    throw new Error("Falha ao gerar bio. Verifique sua chave API.");
  }
};

export const enhanceLinkTitle = async (url: string, currentTitle: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = `Melhore este título de link para torná-lo mais clicável (call-to-action).
    URL: ${url}
    Título Atual: ${currentTitle}
    Máximo 30 caracteres. Adicione 1 emoji no início que combine com o link.
    Idioma: Português.
    Retorne APENAS o novo título.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || currentTitle;
  } catch (error) {
    console.error("Error enhancing title:", error);
    return currentTitle; // Return original on error
  }
};