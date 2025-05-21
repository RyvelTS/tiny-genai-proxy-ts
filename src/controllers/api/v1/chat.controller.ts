import { Response, NextFunction } from 'express';
import { ChatRequest } from '../../../types/api/v1/chat.request';
import logger from '../../../utils/logger';
import GeminiChatService from '../../../services/api/v1/gemini-chat.service';
import { GeminiChatRequestPayload, GeminiChatServiceError } from '../../../types/gemini/gemini';

class ChatController {
    public static async handleChatMessage(
        req: ChatRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const {
                systemPrompt,
                conversationHistory,
                newUserMessage,
                modelName,
            } = req.body;

            const payload: GeminiChatRequestPayload = {
                systemPrompt,
                conversationHistory,
                newUserMessage,
                modelName,
            };

            logger.debug('User message received:', newUserMessage);
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
                next(error);
            }
        }
    }
}

export default ChatController;