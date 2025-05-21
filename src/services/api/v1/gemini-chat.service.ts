import { GeminiChatRequestPayload } from "../../../types/gemini/gemini";
import GeminiService from "../../gemini/gemini.service";

class GeminiChatService {
    public async processChat(payload: GeminiChatRequestPayload) {
        const { systemPrompt, newUserMessage } = payload;
        const SYSTEM_MESSAGE_TAG = "[[SYS_EVAL_RESULT]]";
        const evaluationResult = await GeminiService.evaluatePromptSafety(systemPrompt, newUserMessage);
        let userMessageForModel = newUserMessage;
        if (evaluationResult.isMalicious) {
            userMessageForModel = `${SYSTEM_MESSAGE_TAG} The previous user input was flagged as malicious. Reason: '${evaluationResult.reason}'. The original message has been withheld and will not be processed.`;
        }
        const aiResponseText = await GeminiService.generateText({ ...payload, newUserMessage: userMessageForModel });
        return {
            isMalicious: evaluationResult.isMalicious,
            response: aiResponseText,
            reason: evaluationResult.reason
        };
    }
}

export default new GeminiChatService();