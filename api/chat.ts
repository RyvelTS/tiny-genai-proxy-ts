// File: api/chat.ts
import type { Request, Response } from 'express';
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

export default async function handler(
    req: Request,
    res: Response,
) {
    // Handle preflight (OPTIONS) requests
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set.');
        return res.status(500).json({ error: 'API key not configured.' });
    }

    try {
        const {
            systemPrompt, // The guard prompt string from the frontend
            conversationHistory, // Array of { role: string, parts: string[] }
            newUserMessage, // The latest user message string
            modelName, // Model name can be overridden by frontend
        } = req.body;

        // Use model from env if not provided
        const effectiveModelName = modelName || process.env.GEMINI_DEFAULT_MODEL;

        const genAI = new GoogleGenerativeAI(apiKey);

        // Flatten conversation history and system prompt into a single array of strings
        const promptParts: string[] = [];
        if (systemPrompt) promptParts.push(systemPrompt);
        if (conversationHistory) {
            for (const msg of conversationHistory) {
                promptParts.push(...msg.parts);
            }
        }
        promptParts.push(newUserMessage);

        const model = genAI.getGenerativeModel({
            model: effectiveModelName,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
            generationConfig: {
                responseMimeType: "text/plain",
            }
        });

        const result = await model.generateContent(promptParts);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        if (error instanceof GoogleGenerativeAIFetchError) {
            // You can inspect error.message or error.status for more details
            let userMessage = 'The AI service is temporarily unavailable. Please try again later.';
            if (error.message.toLowerCase().includes('user location is not supported')) {
                userMessage = 'Sorry, this service is not available in your region';
            } else if (error.message.toLowerCase().includes('api key not valid')) {
                userMessage = 'Sorry, this service is currently not available';
            } else if (error.message.toLowerCase().includes('quota exceeded')) {
                userMessage = 'Sorry, this service is currently experiencing heavy traffic. Please try again later.';
            }
            return res.status(500).json({
                errorMessage: userMessage
            });
        } else if (error instanceof Error) {
            return res.status(500).json({ error: 'Internal Server Error', details: error.message });
        } else {
            return res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
}