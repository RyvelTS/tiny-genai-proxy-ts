import OpenAI from "openai";
import { Content, GenerateContentConfig } from "@google/genai";
import GeminiService from "./gemini/gemini.service.js";

// --- INTERFACES AND ENUMS ---

export interface UnifiedModel {
  id: string;
  provider: string;
  ownedBy?: string;
  displayName?: string;
  description?: string;
}

export enum AiService {
  OpenAI = "openai",
  Azure = "azure",
  Google = "google",
  Claude = "claude",
  DeepSeek = "deepseek",
}

export type Credentials = {
  apiKey: string;
  azureEndpoint?: string;
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UnifiedChatResponse {
  id: string;
  content: string;
  model: string;
  provider: string;
}

// --- API Response Type Definitions ---

interface GoogleGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface ClaudeMessagesResponse {
  id: string;
  model: string;
  content?: Array<{
    type?: "text";
    text?: string;
  }>;
}

interface GoogleListModelsResponse {
  models?: Array<{
    name: string;
    displayName?: string;
    description?: string;
  }>;
}

interface ClaudeListModelsResponse {
  data: Array<{ id: string }>;
}

class AiModelService {
  public async createChatCompletion(
    service: AiService,
    model: string,
    messages: ChatMessage[],
    credentials: Credentials,
    schema?: object,
  ): Promise<UnifiedChatResponse> {
    const effectiveMessages = schema
      ? this._appendSchemaToMessages(messages, schema)
      : messages;

    switch (service) {
      case AiService.OpenAI:
        return this._createOpenAIChatCompletion(
          model,
          effectiveMessages,
          credentials.apiKey,
          !!schema,
        );

      case AiService.DeepSeek:
        return this._createOpenAICompatibleChatCompletion(
          model,
          effectiveMessages,
          credentials.apiKey,
          "https://api.deepseek.com",
          "deepseek",
          !!schema,
        );

      case AiService.Azure:
        console.log("AZURE");
        if (!credentials.azureEndpoint) {
          throw new Error(
            "Azure service requires an 'azureEndpoint' in credentials.",
          );
        }
        return this._createOpenAICompatibleChatCompletion(
          model,
          effectiveMessages,
          credentials.apiKey,
          credentials.azureEndpoint,
          "azure",
          !!schema,
          true,
        );

      case AiService.Google:
        return this._createGoogleChatCompletion(
          model,
          effectiveMessages,
          credentials.apiKey,
          !!schema,
        );

      case AiService.Claude:
        return this._createClaudeChatCompletion(
          model,
          effectiveMessages,
          credentials.apiKey,
        );

      default:
        throw new Error(
          `Service "${service}" is not supported for chat completion.`,
        );
    }
  }

  private _appendSchemaToMessages(
    messages: ChatMessage[],
    schema: object,
  ): ChatMessage[] {
    const schemaInstruction = `\n\nYour response MUST be a valid JSON object that strictly adheres to the following JSON schema. Do not include any text, markdown, or explanations outside of the JSON object itself:\n\n${JSON.stringify(schema, null, 2)}`;
    const updatedMessages = [...messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    updatedMessages[updatedMessages.length - 1] = {
      ...lastMessage,
      content: lastMessage.content + schemaInstruction,
    };
    return updatedMessages;
  }

  private async _createOpenAICompatibleChatCompletion(
    model: string,
    messages: ChatMessage[],
    apiKey: string,
    baseURL: string,
    provider: string,
    isJsonMode: boolean,
    isAzure: boolean = false,
  ): Promise<UnifiedChatResponse> {
    const config: any = { apiKey, baseURL };
    if (isAzure) {
      config.defaultHeaders = { "api-key": apiKey };
    }
    const client = new OpenAI(config);
    const requestBody: OpenAI.Chat.Completions.ChatCompletionCreateParams = {
      model,
      messages: messages as any,
    };
    if (isJsonMode) {
      requestBody.response_format = { type: "json_object" };
    }
    const response = await client.chat.completions.create(requestBody);
    const content = response.choices[0]?.message?.content;
    if (content === null || content === undefined) {
      throw new Error("Received a null response from the AI service.");
    }
    return {
      id: response.id,
      content: content,
      model: response.model,
      provider: provider,
    };
  }

  private _createOpenAIChatCompletion(
    model: string,
    messages: ChatMessage[],
    apiKey: string,
    isJsonMode: boolean,
  ): Promise<UnifiedChatResponse> {
    return this._createOpenAICompatibleChatCompletion(
      model,
      messages,
      apiKey,
      "https://api.openai.com/v1",
      "openai",
      isJsonMode,
    );
  }

  private async _createGoogleChatCompletion(
    model: string,
    messages: ChatMessage[],
    apiKey: string,
    isJsonMode: boolean,
  ): Promise<UnifiedChatResponse> {
    try {
      const systemInstruction = messages.find(
        (m) => m.role === "system",
      )?.content;
      const googleMessages: Content[] = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const config: GenerateContentConfig = {};
      if (isJsonMode) {
        config.responseMimeType = "application/json";
      }

      const content = await GeminiService.createChatCompletionWithKey(
        apiKey,
        model,
        googleMessages,
        config,
        systemInstruction,
      );

      return {
        id: `gemini-${Date.now()}`,
        content,
        model,
        provider: "google",
      };
    } catch (error) {
      console.error(
        "Error delegating chat completion to GeminiService:",
        error,
      );
      throw new Error(
        "An error occurred while communicating with the Google AI service.",
      );
    }
  }

  private async _createClaudeChatCompletion(
    model: string,
    messages: ChatMessage[],
    apiKey: string,
  ): Promise<UnifiedChatResponse> {
    const url = "https://api.anthropic.com/v1/messages";
    const systemPrompt = messages.find((m) => m.role === "system");
    const userMessages = messages.filter((m) => m.role !== "system");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: userMessages,
        system: systemPrompt?.content,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API request failed: ${await response.text()}`);
    }

    // FIX: Cast the parsed JSON to our defined type
    const data = (await response.json()) as ClaudeMessagesResponse;
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error("Invalid response structure from Claude API.");
    }
    return { id: data.id, content, model: data.model, provider: "claude" };
  }

  // --- Methods for Listing Models (Now Type-Safe) ---
  public async getModels(
    service: AiService,
    credentials: Credentials,
  ): Promise<UnifiedModel[]> {
    switch (service) {
      case AiService.OpenAI:
        return this._getOpenAIModels(credentials.apiKey);
      case AiService.DeepSeek:
        return this._getOpenAICompatibleModels(
          credentials.apiKey,
          "https://api.deepseek.com",
          "deepseek",
        );
      case AiService.Azure:
        if (!credentials.azureEndpoint)
          throw new Error("Azure endpoint required.");
        return this._getOpenAICompatibleModels(
          credentials.apiKey,
          credentials.azureEndpoint,
          "azure",
          true,
        );
      case AiService.Google:
        return this._getGoogleModels(credentials.apiKey);
      case AiService.Claude:
        return this._getClaudeModels(credentials.apiKey);
      default:
        throw new Error(`Service "${service}" is not supported.`);
    }
  }

  private async _getOpenAICompatibleModels(
    apiKey: string,
    baseURL: string,
    provider: string,
    isAzure: boolean = false,
  ): Promise<UnifiedModel[]> {
    const config: any = { apiKey, baseURL };
    if (isAzure) config.defaultHeaders = { "api-key": apiKey };
    const client = new OpenAI(config);
    const list = await client.models.list();
    return list.data.map((m) => ({ id: m.id, ownedBy: m.owned_by, provider }));
  }

  private _getOpenAIModels(apiKey: string): Promise<UnifiedModel[]> {
    return this._getOpenAICompatibleModels(
      apiKey,
      "https://api.openai.com/v1",
      "openai",
    );
  }

  private async _getGoogleModels(apiKey: string): Promise<UnifiedModel[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to get Google models.");
    const data = (await res.json()) as GoogleListModelsResponse;
    return (
      data.models?.map((m) => ({
        id: m.name.replace("models/", ""),
        provider: "google",
        ownedBy: "google",
        displayName: m.displayName,
        description: m.description,
      })) ?? []
    );
  }

  private async _getClaudeModels(apiKey: string): Promise<UnifiedModel[]> {
    const url = "https://api.anthropic.com/v1/models";
    const headers = { "x-api-key": apiKey, "anthropic-version": "2023-06-01" };
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Failed to get Claude models.");
    const data = (await res.json()) as ClaudeListModelsResponse;
    return data.data.map((m) => ({
      id: m.id,
      provider: "claude",
      ownedBy: "anthropic",
    }));
  }
}

export default new AiModelService();
