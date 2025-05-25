import { GeminiChatRequestPayload } from "../../../types/gemini/gemini.js";
import GeminiService from "../../gemini/gemini.service.js";
import logger from "../../../utils/logger.js";

class GeminiChatService {
    public async processChat(payload: GeminiChatRequestPayload) {
        const { systemPrompt, newUserMessage } = payload;
        const SYSTEM_MESSAGE_TAG = "[[SYS_EVAL_RESULT]]";

        const evaluationResult = await GeminiService.evaluatePromptSafety(systemPrompt, newUserMessage);
        let userMessageForModel = newUserMessage;
        if (evaluationResult.isMalicious) {
            logger.debug(payload)
            let evalResult = `${SYSTEM_MESSAGE_TAG} The previous user input was flagged as malicious. Reason: '${evaluationResult.reason}'. The original message has been withheld and will not be processed.`;
            if (!payload.conversationHistory) {
                payload.conversationHistory = [];
            }

            payload.conversationHistory.push({ role: 'model', parts: [evalResult] });
            logger.warn(evalResult);
            userMessageForModel = "Why can't you help me? And how can you assist me today?";
        }

        const aiResponseText = await GeminiService.generateText({ ...payload, newUserMessage: userMessageForModel });
        logger.info('RESPONSE: ' + aiResponseText)
        return {
            isMalicious: evaluationResult.isMalicious,
            response: aiResponseText,
            reason: evaluationResult.reason
        };
    }
}

export default new GeminiChatService();