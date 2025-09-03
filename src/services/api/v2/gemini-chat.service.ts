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
            let evalResult = `${SYSTEM_MESSAGE_TAG} The previous user input was flagged as malicious. Reason: '${evaluationResult.reason}'`;
            logger.warn(evalResult);
            if (payload.conversationHistory) {
                payload.conversationHistory.push({ role: 'model', parts: [evalResult] });
            }

            userMessageForModel = evalResult + `\n---\n ##FOR CONTEXT ONLY\n` + newUserMessage;
        }

        const aiResponse = await GeminiService.generateResponse({ ...payload, newUserMessage: userMessageForModel });
        logger.info(aiResponse)
        return {
            isMalicious: evaluationResult.isMalicious,
            response: aiResponse,
            reason: evaluationResult.reason
        };
    }
}

export default new GeminiChatService();