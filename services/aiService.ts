import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SearchResult {
  text: string;
  sources: { uri: string; title: string }[];
}

export const fetchCardUpdates = async (cardName: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the latest official information, recent devaluations, changes in reward terms, or special limited-time offers for the "${cardName}" credit card in India.
      Focus on events from the last 6 months.
      Summarize the key findings in 3-4 concise bullet points.
      If there are no major changes, mention the current top active offer.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No recent updates found.";
    
    // Extract grounding sources if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

    // Deduplicate sources based on URI
    const uniqueSources = sources.filter((source: any, index: number, self: any[]) =>
      index === self.findIndex((s) => s.uri === source.uri)
    );

    return { text, sources: uniqueSources };
  } catch (error) {
    console.error("Error fetching card updates:", error);
    return { 
      text: "Unable to fetch the latest updates at this moment. Please try again later.", 
      sources: [] 
    };
  }
};