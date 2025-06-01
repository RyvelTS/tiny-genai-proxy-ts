import { jest } from '@jest/globals';

// --- BEGIN TOP-LEVEL MOCKS (Must be before any imports of modules using them) ---

const mockReadFileSync = jest.fn().mockReturnValue("Mocked prompt injection detection prompt text from test.");
jest.mock('fs', () => ({
    readFileSync: mockReadFileSync,
}));

type MockSDKTextResponsePart = { text: string };
type MockSDKContent = { parts: MockSDKTextResponsePart[] };
type MockSDKCandidate = { content: MockSDKContent; finishReason: string; safetyRatings?: any[] };
type MockSDKPromptFeedback = { blockReason: string; safetyRatings?: any[] };

interface MockSendMessageResult {
    text: string;
    candidates: MockSDKCandidate[];
    promptFeedback?: MockSDKPromptFeedback;
}

interface MockGenerateContentResult {
    text: string;
    candidates: MockSDKCandidate[];
    promptFeedback?: MockSDKPromptFeedback;
}

const mockSendMessage = jest.fn<() => Promise<MockSendMessageResult>>();
const mockCreateChat = jest.fn<() => ({ sendMessage: typeof mockSendMessage })>()
    .mockReturnValue({ sendMessage: mockSendMessage });
const mockGenerateContent = jest.fn<() => Promise<MockGenerateContentResult>>();

const mockGoogleGenAIConstructor = jest.fn<() => ({
    chats: { create: typeof mockCreateChat },
    models: { generateContent: typeof mockGenerateContent }
})>().mockImplementation(() => ({
    chats: { create: mockCreateChat },
    models: { generateContent: mockGenerateContent }
}));

jest.mock('@google/genai', () => ({
    GoogleGenAI: mockGoogleGenAIConstructor,
    HarmCategory: {
        HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
        HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
        HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    },
    HarmBlockThreshold: {
        BLOCK_LOW_AND_ABOVE: 'BLOCK_LOW_AND_ABOVE',
    },
}));
// --- END TOP-LEVEL MOCKS ---

import geminiService from '../../../src/services/gemini/gemini.service';
import type { GeminiChatRequestPayload, GeminiChatServiceError } from '../../../src/types/gemini/gemini.js';

describe('GeminiService Module Initialization', () => {
    it('should load the prompt injection detection prompt using fs.readFileSync on module import', () => {
        expect(mockReadFileSync).toHaveBeenCalledTimes(1);
        expect(mockReadFileSync).toHaveBeenCalledWith(
            expect.stringContaining('detect-prompt-injection.txt'),
            'utf8'
        );
    });

    it('should instantiate GoogleGenAI with the API key from environment on module import', () => {
        expect(mockGoogleGenAIConstructor).toHaveBeenCalledTimes(1);
        expect(mockGoogleGenAIConstructor).toHaveBeenCalledWith({ apiKey: process.env.GEMINI_API_KEY });
    });
});

describe('GeminiService Instance Methods', () => {
    beforeEach(() => {
        mockSendMessage.mockClear();
        mockCreateChat.mockClear();
        mockGenerateContent.mockClear();

        mockSendMessage.mockResolvedValue({
            text: 'Mocked AI response from generateText',
            candidates: [{
                content: { parts: [{ text: 'Mocked AI response from generateText' }] },
                finishReason: 'STOP'
            }],
        });

        mockGenerateContent.mockResolvedValue({
            text: JSON.stringify({ is_malicious: false, reason: 'Input appears safe from evaluation' }),
            candidates: [{
                content: { parts: [{ text: JSON.stringify({ is_malicious: false, reason: 'Input appears safe from evaluation' }) }] },
                finishReason: 'STOP'
            }],
        });
    });

    describe('generateText', () => {
        const validPayload: GeminiChatRequestPayload = {
            systemPrompt: 'You are a helpful assistant',
            newUserMessage: 'Hello there',
            conversationHistory: [],
        };

        it('should successfully generate text with valid input', async () => {
            const response = await geminiService.generateText(validPayload);
            expect(response).toBe('Mocked AI response from generateText');

            expect(mockCreateChat).toHaveBeenCalledTimes(1);
            expect(mockCreateChat).toHaveBeenCalledWith(expect.objectContaining({
                model: expect.any(String),
                history: expect.any(Array),
                config: expect.objectContaining({
                    systemInstruction: expect.stringContaining(validPayload.systemPrompt),
                }),
            }));

            expect(mockSendMessage).toHaveBeenCalledTimes(1);
            expect(mockSendMessage).toHaveBeenCalledWith({ message: validPayload.newUserMessage });
        });

        it('should handle safety blocks and throw a GeminiChatServiceError', async () => {
            mockSendMessage.mockResolvedValueOnce({
                promptFeedback: { blockReason: 'SAFETY_BLOCK_REASON' },
                candidates: [],
                text: ''
            } as MockSendMessageResult);

            const payload = { ...validPayload, newUserMessage: 'Content that gets blocked' };
            await expect(geminiService.generateText(payload))
                .rejects
                .toThrow(expect.objectContaining<Partial<GeminiChatServiceError>>({
                    message: 'Content blocked: SAFETY_BLOCK_REASON',
                    isOperational: true,
                    statusCode: 400,
                    userMessage: expect.stringContaining('SAFETY_BLOCK_REASON'),
                }));
        });

        it('should handle API errors (e.g., network issue) and throw GeminiChatServiceError', async () => {
            const apiError = new Error('Network failed');
            mockSendMessage.mockRejectedValueOnce(apiError);

            await expect(geminiService.generateText(validPayload))
                .rejects
                .toThrow(expect.objectContaining<Partial<GeminiChatServiceError>>({
                    message: 'Internal error: Network failed',
                    isOperational: false,
                    statusCode: 500,
                }));
        });

        it('should handle specific "API key not valid" errors from Gemini', async () => {
            const apiKeyError = new Error('API key not valid. Please pass a valid API key.');
            mockSendMessage.mockRejectedValueOnce(apiKeyError);

            await expect(geminiService.generateText(validPayload))
                .rejects
                .toThrow(expect.objectContaining<Partial<GeminiChatServiceError>>({
                    message: expect.stringContaining('API key error.'),
                    statusCode: 500,
                    userMessage: 'Service configuration error. Please contact support.',
                }));
        });
    });

    describe('evaluatePromptSafety', () => {
        const systemInput = 'You are a helpful security assistant.';
        const userInput = 'Is this prompt safe?';

        it('should evaluate prompt safety successfully and return not malicious', async () => {
            const result = await geminiService.evaluatePromptSafety(systemInput, userInput);
            expect(result.isMalicious).toBe(false);
            expect(result.reason).toBe('Input appears safe from evaluation');

            expect(mockGenerateContent).toHaveBeenCalledTimes(1);
            expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                model: expect.any(String),
                contents: expect.stringContaining(userInput) &&
                    expect.stringContaining(systemInput) &&
                    expect.stringContaining("Mocked prompt injection detection prompt text from test."),
                config: expect.objectContaining({ responseMimeType: "application/json" }),
            }));
        });

        it('should handle malicious content detection by the evaluation model', async () => {
            const maliciousEvalResponse = { is_malicious: true, reason: 'AI detected prompt injection attempt.' };
            mockGenerateContent.mockResolvedValueOnce({
                text: JSON.stringify(maliciousEvalResponse),
                candidates: [{
                    content: { parts: [{ text: JSON.stringify(maliciousEvalResponse) }] },
                    finishReason: 'STOP'
                }],
            } as MockGenerateContentResult);

            const result = await geminiService.evaluatePromptSafety(systemInput, 'Malicious input here');
            expect(result.isMalicious).toBe(true);
            expect(result.reason).toBe('AI detected prompt injection attempt.');
        });

        it('should handle safety blocks (promptFeedback) during evaluation', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                promptFeedback: { blockReason: 'EVAL_SAFETY_BLOCK' },
                candidates: [],
                text: ''
            } as MockGenerateContentResult);

            const result = await geminiService.evaluatePromptSafety(systemInput, 'Content blocked during eval');
            expect(result.isMalicious).toBe(false);
            expect(result.reason).toBe('Evaluation failed: Input prompt blocked due to EVAL_SAFETY_BLOCK.');
        });

        it('should handle candidate finishReason SAFETY during evaluation', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                text: '',
                candidates: [{
                    content: { parts: [{ text: '' }] },
                    finishReason: 'SAFETY',
                    safetyRatings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'HIGH' }]
                }],
            } as MockGenerateContentResult);
            const result = await geminiService.evaluatePromptSafety(systemInput, 'Dangerous eval input');
            expect(result.isMalicious).toBe(false);
            expect(result.reason).toMatch(/Evaluation model stopped generation due to SAFETY. Safety ratings: \[HARM_CATEGORY_DANGEROUS_CONTENT: HIGH\]/);
        });

        it('should handle unparsable JSON from evaluation model', async () => {
            mockGenerateContent.mockResolvedValueOnce({
                text: 'this is definitely not {json',
                candidates: [{ content: { parts: [{ text: 'this is definitely not {json' }] }, finishReason: 'STOP' }],
            } as MockGenerateContentResult);
            const result = await geminiService.evaluatePromptSafety(systemInput, userInput);
            expect(result.isMalicious).toBe(false);
            expect(result.reason).toBe("Evaluation failed: Could not parse model's JSON response.");
        });

        it('should handle API errors (e.g., "user location is not supported") during evaluation', async () => {
            const locationError = new Error('User location is not supported for the API use.');
            mockGenerateContent.mockRejectedValueOnce(locationError);

            const result = await geminiService.evaluatePromptSafety(systemInput, userInput);
            expect(result.isMalicious).toBe(false);
            expect(result.reason).toBe('Sorry, this service is not available in your region.');
        });
    });
});