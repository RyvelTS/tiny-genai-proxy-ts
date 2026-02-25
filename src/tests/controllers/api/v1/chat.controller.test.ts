import { Response } from "express";
import type { ChatRequest } from "../../../../src/types/api/v1/chat.request.js";
import ChatController from "../../../../src/controllers/api/v1/chat.controller.js";
import { jest } from "@jest/globals";
import type {
  GeminiChatRequestPayload,
  GeminiChatServiceError,
} from "../../../../src/types/gemini/gemini.ts";

// --- Type Definitions for Mocking ---
interface ProcessChatPayload {
  systemPrompt: string;
  newUserMessage: string;
  conversationHistory?: any[];
  modelName?: string;
}

interface ProcessChatServiceResponse {
  response: string;
}

// --- Mock Setup for STATIC method ---
const MOCK_STATIC_PROCESS_CHAT_FN =
  jest.fn<
    (payload: ProcessChatPayload) => Promise<ProcessChatServiceResponse>
  >();

jest.mock("../../../../src/services/api/v1/gemini-chat.service.js", () => {
  return {
    __esModule: true,
    default: class GeminiChatServiceMock {
      static processChat = MOCK_STATIC_PROCESS_CHAT_FN;
    },
  };
});
// --- End Mock Setup ---

describe("ChatController", () => {
  let mockRequest: Partial<ChatRequest>;
  let mockResponse: Response;

  beforeEach(() => {
    mockRequest = {
      body: {
        systemPrompt: "default system prompt",
        newUserMessage: "default user message",
      },
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      locals: {},
    } as unknown as Response;

    MOCK_STATIC_PROCESS_CHAT_FN.mockClear();
  });

  describe("handleChatMessage", () => {
    it("should successfully handle a chat request", async () => {
      const serviceResponse: ProcessChatServiceResponse = {
        response: "Hello, how can I help you?",
      };
      const requestPayload: ProcessChatPayload = {
        systemPrompt: "You are a helpful assistant",
        newUserMessage: "Hello",
      };
      mockRequest.body = requestPayload;

      MOCK_STATIC_PROCESS_CHAT_FN.mockResolvedValueOnce(serviceResponse);

      await ChatController.handleChatMessage(
        mockRequest as ChatRequest,
        mockResponse,
      );

      expect(MOCK_STATIC_PROCESS_CHAT_FN).toHaveBeenCalledTimes(1);
      expect(MOCK_STATIC_PROCESS_CHAT_FN).toHaveBeenCalledWith(requestPayload);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(serviceResponse);
    });

    it("should handle service errors properly", async () => {
      const mockError = new Error("Service error");

      const requestPayload: ProcessChatPayload = {
        systemPrompt: "You are a helpful assistant",
        newUserMessage: "Hello",
      };
      mockRequest.body = requestPayload;

      MOCK_STATIC_PROCESS_CHAT_FN.mockRejectedValueOnce(mockError);

      await ChatController.handleChatMessage(
        mockRequest as ChatRequest,
        mockResponse,
      );

      expect(MOCK_STATIC_PROCESS_CHAT_FN).toHaveBeenCalledTimes(1);
      expect(MOCK_STATIC_PROCESS_CHAT_FN).toHaveBeenCalledWith(requestPayload);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "An unexpected error occurred.",
        }),
      );
    });

    it("should handle operational service errors with specific status and message", async () => {
      const operationalError = new Error(
        "Location not supported by service",
      ) as GeminiChatServiceError;
      operationalError.isOperational = true;
      operationalError.statusCode = 403;
      operationalError.userMessage =
        "Service not available in your region due to location.";

      const requestPayload: ProcessChatPayload = {
        systemPrompt: "You are a helpful assistant",
        newUserMessage: "Hello from restricted area",
      };
      mockRequest.body = requestPayload;

      MOCK_STATIC_PROCESS_CHAT_FN.mockRejectedValueOnce(operationalError);

      await ChatController.handleChatMessage(
        mockRequest as ChatRequest,
        mockResponse,
      );

      expect(MOCK_STATIC_PROCESS_CHAT_FN).toHaveBeenCalledWith(requestPayload);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Service not available in your region due to location.",
      });
    });

    it("should return 400 if newUserMessage is missing (validation)", async () => {
      mockRequest.body = {
        systemPrompt: "A system prompt",
      } as any;

      await ChatController.handleChatMessage(
        mockRequest as ChatRequest,
        mockResponse,
      );

      expect(MOCK_STATIC_PROCESS_CHAT_FN).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing required fields" }),
      );
    });

    it("should return 400 if systemPrompt is missing (validation)", async () => {
      mockRequest.body = {
        newUserMessage: "A user message",
      } as any;

      await ChatController.handleChatMessage(
        mockRequest as ChatRequest,
        mockResponse,
      );

      expect(MOCK_STATIC_PROCESS_CHAT_FN).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Missing required fields" }),
      );
    });
  });
});
