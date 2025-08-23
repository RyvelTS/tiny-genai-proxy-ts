import { GenerateContentConfig } from "@google/genai";
export interface GeminiMessagePart {
    text: string;
}

export interface GeminiChatRequestPayload {
    systemPrompt: string;
    conversationHistory?: Array<{ role: "user" | "model" | "function" | "system"; parts: string[] }>;
    newUserMessage: string;
    modelName?: string;
    config?: GenerateContentConfig;
}

export interface GeminiChatServiceError extends Error {
    isOperational?: boolean;
    statusCode?: number;
    userMessage?: string;
}

export interface PromptEvaluationResult {
    isMalicious: boolean;
    reason: string;
}
