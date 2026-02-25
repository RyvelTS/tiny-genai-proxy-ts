import { Response, NextFunction } from "express";
import { ChatRequest } from "../../../types/api/v2/chat.request.js";
import logger from "../../../utils/logger.js";
import GeminiChatService from "../../../services/api/v2/gemini-chat.service.js";
import {
  GeminiChatRequestPayload,
  GeminiChatServiceError,
} from "../../../types/gemini/gemini.js";

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
        config,
      } = req.body;

      const payload: GeminiChatRequestPayload = {
        systemPrompt,
        conversationHistory,
        newUserMessage,
        modelName,
        config,
      };

      logger.info("User message received at (V2): ", newUserMessage);
      const response = await GeminiChatService.processChat(payload);
      res.status(200).json(response);
      return;
    } catch (error) {
      logger.error("Error in ChatController.handleChatMessage:", error);
      if (
        error instanceof Error &&
        (error as GeminiChatServiceError).isOperational
      ) {
        const serviceError = error as GeminiChatServiceError;
        logger.warn("Operational error for client:", {
          message: serviceError.userMessage,
          statusCode: serviceError.statusCode,
        });
        res.status(serviceError.statusCode || 500).json({
          error: serviceError.userMessage || "An unexpected error occurred.",
        });
        return;
      } else {
        logger.error("Unexpected Error");
        res.status(500).json({
          error: "An unexpected error occurred.",
        });
      }
    }
  }
}

export default ChatController;
