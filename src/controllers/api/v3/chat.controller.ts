import { Response, Request, NextFunction } from 'express';
import { ChatRequest } from '../../../types/api/v3/chat.request.js';
import logger from '../../../utils/logger.js';
import GeminiChatService from '../../../services/api/v2/gemini-chat.service.js';
import { GeminiChatRequestPayload, GeminiChatServiceError } from '../../../types/gemini/gemini.js';
import AiModelService, { AiService, Credentials } from '../../../services/ai-model.service.js';

class ChatController {
    public static async handleChatMessage(
        req: ChatRequest,
        res: Response,
    ): Promise<void> {
        try {
            const {
                systemPrompt,
                conversationHistory,
                newUserMessage,
                modelName,
                config
            } = req.body;

            const payload: GeminiChatRequestPayload = {
                systemPrompt,
                conversationHistory,
                newUserMessage,
                modelName,
                config
            };

            logger.info('User message received at (V3): ', newUserMessage);
            const response = await GeminiChatService.processChat(payload);
            res.status(200).json(response);
            return;
        } catch (error) {
            logger.error('Error in ChatController.handleChatMessage:', error);
            if (error instanceof Error && (error as GeminiChatServiceError).isOperational) {
                const serviceError = error as GeminiChatServiceError;
                logger.warn('Operational error for client:', {
                    message: serviceError.userMessage,
                    statusCode: serviceError.statusCode
                });
                res.status(serviceError.statusCode || 500).json({
                    error: serviceError.userMessage || 'An unexpected error occurred.',
                });
                return;
            } else {
                logger.error('Unexpected Error')
                res.status(500).json({
                    error: 'An unexpected error occurred.',
                });
            }
        }
    }

    /**
     * Handles requests to list available models from a selected AI provider.
     * Expects the service name as a query parameter and API key in the Authorization header.
     */
    public static async getAvailableModels(
        req: Request,
        res: Response,
    ): Promise<void> {
        try {
            // 1. Extract service from query parameters
            const service = req.query.service as AiService;
            const azureEndpoint = req.query.endpoint as string | undefined;

            // 2. Extract API key from a custom header 'X-API-Key'
            const apiKey = req.headers['x-api-key'] as string;

            // 3. Validate the inputs
            if (!service || !Object.values(AiService).includes(service)) {
                res.status(400).json({ error: 'A valid "service" query parameter is required.' });
                return;
            }

            // Check for the custom header
            if (!apiKey) {
                res.status(401).json({ error: 'The "X-API-Key" header is missing or empty.' });
                return;
            }

            // 4. Prepare credentials
            const credentials: Credentials = { apiKey, azureEndpoint };

            logger.info(`Request received to list models for service: ${service}`);

            // 5. Call the service and return the models
            const models = await AiModelService.getModels(service, credentials);
            res.status(200).json(models);

        } catch (error: any) {
            logger.error(`Error in getAvailableModels for service "${req.query.service}":`, error);
            res.status(500).json({
                error: error.message || 'An unexpected error occurred while fetching models.',
            });
        }
    }
}

export default ChatController;