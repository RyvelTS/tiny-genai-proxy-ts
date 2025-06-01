import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { validateChatRequest } from '../../../../src/middlewares/api/v1/chat.middleware.js';

describe('Chat Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;
    mockNext = jest.fn();
  });

  it('should pass valid requests', () => {
    mockRequest.body = {
      systemPrompt: 'You are a helpful assistant',
      newUserMessage: 'Hello',
    };

    validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect((mockResponse.status as jest.Mock | undefined)?.mock.calls.length ?? 0).toBe(0);
  });

  it('should reject requests without newUserMessage', () => {
    mockRequest.body = {
      systemPrompt: 'You are a helpful assistant',
    };

    validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockResponse.status as jest.Mock)).toHaveBeenCalledWith(400);
    expect((mockResponse.json as jest.Mock)).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });

  it('should reject requests with empty newUserMessage', () => {
    mockRequest.body = {
      systemPrompt: 'You are a helpful assistant',
      newUserMessage: '',
    };

    validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockResponse.status as jest.Mock)).toHaveBeenCalledWith(400);
    expect((mockResponse.json as jest.Mock)).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });

  it('should reject requests with invalid conversationHistory', () => {
    mockRequest.body = {
      systemPrompt: 'You are a helpful assistant',
      newUserMessage: 'Hello',
      conversationHistory: [{ role: 'user', parts: [] }],
    };

    validateChatRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockResponse.status as jest.Mock)).toHaveBeenCalledWith(400);
    expect((mockResponse.json as jest.Mock)).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
      })
    );
  });
});
