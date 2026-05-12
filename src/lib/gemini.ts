import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const MODELS = {
  chat: "gemini-3-flash-preview",
  image: "gemini-3.1-flash-image-preview",
  tts: "gemini-3.1-flash-tts-preview",
};

export async function chatWithGemini(messages: { role: string, content: string }[], config?: any, userApiKey?: string) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
  const aiClient = new GoogleGenAI({ apiKey });

  const response = await aiClient.models.generateContent({
    model: MODELS.chat,
    contents: messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    // @ts-ignore
    tools: [
      { googleSearch: {} },
      {
        functionDeclarations: [
          {
            name: "generate_image",
            description: "Generate a high-quality image based on a descriptive prompt. Use this when the user asks to see, create, or generate an image.",
            parameters: {
              type: "OBJECT",
              properties: {
                prompt: {
                  type: "STRING",
                  description: "A detailed, descriptive prompt for the image generation. Include style, lighting, and composition tokens for high quality."
                },
                aspectRatio: {
                  type: "STRING",
                  description: "The aspect ratio of the image. Default is '1:1'. Options: '1:1', '16:9', '9:16', '4:3', '3:4'.",
                  enum: ["1:1", "16:9", "9:16", "4:3", "3:4"]
                }
              },
              required: ["prompt"]
            }
          }
        ]
      }
    ],
    config: {
      systemInstruction: "You are MiniGPT, a premium AI assistant created by Bishnu Raidash. You are also a world-class Social Media Strategist and Viral Growth Expert. You have a friendly, helpful personality. You specialize in creating viral hooks, video scripts, and social media growth strategies. You can browse the web, use maps, and generate high-quality images. When generating images, use the generate_image tool with detailed prompts. Always be concise, professional, and trend-aware. Do not reveal internal API key details.",
      ...config
    },
    // @ts-ignore
    toolConfig: { includeServerSideToolInvocations: true }
  });

  return response;
}

export async function generateTTS(text: string, voice: string = 'Kore') {
  const response = await ai.models.generateContent({
    model: MODELS.tts,
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice as any },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  // Convert base64 to bytes
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function generateTitle(firstMessage: string, userApiKey?: string) {
  try {
    const apiKey = userApiKey || process.env.GEMINI_API_KEY || "";
    const aiClient = new GoogleGenAI({ apiKey });

    const result = await aiClient.models.generateContent({
      model: MODELS.chat,
      contents: [{ 
        role: 'user', 
        parts: [{ text: `Based on this first message of a support chat, generate a very short, punchy conversation title (max 5 words). Focus on the core issue, problem, or help requested. Do not use quotation marks: "${firstMessage}"` }] 
      }],
      config: {
        temperature: 0.5,
        maxOutputTokens: 20
      }
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : "New Session";
  } catch (error) {
    console.error("Title generation helper error:", error);
    return "New Session";
  }
}

export async function analyzeImage(imageRef: string, mimeType: string, prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: MODELS.chat,
      contents: {
        parts: [
          { inlineData: { data: imageRef.split(',')[1], mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze the image.";
  } catch (error) {
    console.error("Analyze image error:", error);
    return "Failed to analyze image.";
  }
}

export async function generateImage(prompt: string, aspectRatio: string = "1:1") {
  const response = await ai.models.generateContent({
    model: MODELS.image,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: "2K" // High quality as requested
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}
