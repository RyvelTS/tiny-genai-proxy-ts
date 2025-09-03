import { Response, Request } from 'express';
import logger from '../../../utils/logger.js';
import AiModelService, { AiService, Credentials } from '../../../services/ai-model.service.js';
import { ChatRequest } from '../../../types/api/v3/chat.request.js';

class ChatController {
    /**
     * Handles non-streaming chat requests. It extracts the service, model, messages,
     * and an optional schema from the body, along with credentials from the headers.
     * It then calls the AiModelService to get a response.
     */
    public static async handleChatMessage(
        req: ChatRequest,
        res: Response,
    ): Promise<void> {
        try {
            const { service, model, messages, schema } = req.body;
            const apiKey = req.headers['x-api-key'] as string;
            const azureEndpoint = req.headers['x-azure-endpoint'] as string | undefined;

            if (!service || !Object.values(AiService).includes(service)) {
                res.status(400).json({ error: 'A valid "service" query parameter is required.' });
                return;
            }
            if (!model) {
                res.status(400).json({ error: 'The "model" field is missing from the request body.' });
                return;
            }
            if (!Array.isArray(messages) || messages.length === 0) {
                res.status(400).json({ error: 'The "messages" field must be a non-empty array.' });
                return;
            }
            if (!apiKey) {
                res.status(401).json({ error: 'The "X-API-Key" header is missing or empty.' });
                return;
            }

            const credentials: Credentials = { apiKey, azureEndpoint };
            logger.info(`Request received for chat with service: ${service}, model: ${model}`);

            const chatResponse = await AiModelService.createChatCompletion(
                service,
                model,
                messages,
                credentials,
                schema // Pass the schema; it will be undefined if not provided
            );

            res.status(200).json(chatResponse);
        } catch (error: any) {
            // Log the detailed error for debugging on the server
            logger.error(`Error in handleChatMessage for service "${req.body.service}":`, error);

            res.status(500).json({
                error: error.message || 'An unexpected error occurred during the chat.',
            });
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
            const service = req.query.service as AiService;
            const azureEndpoint = req.query.endpoint as string | undefined;

            const apiKey = req.headers['x-api-key'] as string;

            if (!service || !Object.values(AiService).includes(service)) {
                res.status(400).json({ error: 'A valid "service" query parameter is required.' });
                return;
            }

            if (!apiKey) {
                res.status(401).json({ error: 'The "X-API-Key" header is missing or empty.' });
                return;
            }

            const credentials: Credentials = { apiKey, azureEndpoint };

            logger.info(`Request received to list models for service: ${service}`);
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