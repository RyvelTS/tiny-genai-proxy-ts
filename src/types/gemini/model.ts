export interface GeminiModelConfig {
  model: string;
  contents: Content[];
  tools?: Tool[];
  toolConfig?: ToolConfig;
  safetySettings?: SafetySetting[];
  systemInstruction?: Content;
  generationConfig?: GenerationConfig;
  cachedContent?: string;
}

export interface Content {
  role?: string;
  parts?: Array<{ text: string }>;
}

export interface Tool {
  name: string;
  description?: string;
}

export interface ToolConfig {
  // Define according to Gemini/Google Function calling tool config spec
  // ...fields
}

export interface SafetySetting {
  category: string;
  threshold: string;
}

export interface GenerationConfig {
  responseMimeType?: string;
  responseSchema?: object;
  temperature?: number;
  maxOutputTokens?: number;
}
