import { Response, NextFunction } from 'express';
import { ChatRequest } from '../../../types/api/v1/chat.request';
import logger from '../../../utils/logger';
import GeminiChatService, { GeminiChatRequestPayload, GeminiChatServiceError } from '../../../services/api/v1/gemini-chat.service';

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

            let aiResponseText = ""
            logger.debug('User message received:', newUserMessage);
            const SYSTEM_MESSAGE_TAG = "[[SYS_EVAL_RESULT]]";
            const evaluationResult = await GeminiChatService.evaluatePromptSafety(systemPrompt, newUserMessage);
            if (evaluationResult.isMalicious) {
                payload.newUserMessage = `${SYSTEM_MESSAGE_TAG} The previous user input was flagged as malicious. Reason: '${evaluationResult.reason}'. The original message has been withheld and will not be processed.`;
            }

            aiResponseText = await GeminiChatService.generateText(payload);
            logger.info('Successfully generated AI response', aiResponseText);
            res.status(200).json({
                isMalicious: evaluationResult.isMalicious,
                response: aiResponseText,
                reason: evaluationResult.reason
            });
            return;

        } catch (error) {
            console.error('Error in ChatController.handleChatMessage:', error);

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