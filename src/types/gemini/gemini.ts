export interface GeminiMessagePart {
    text: string;
}

export interface GeminiChatRequestPayload {
    systemPrompt: string;
    conversationHistory?: Array<{ role: "user" | "model" | "function" | "system"; parts: string[] }>;
    newUserMessage: string;
    modelName?: string;
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
