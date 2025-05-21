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
    // ...other Gemini Content fields
}

export interface Tool {
    // Define according to Gemini/Google Function calling or code execution tool spec
    name: string;
    description?: string;
    // ...other tool fields
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
    // ...other generation config fields
}
