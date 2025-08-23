import OpenAI from "openai";

export interface UnifiedModel {
    id: string;
    provider: string;
    ownedBy?: string;
    displayName?: string;
    description?: string;
}

export enum AiService {
    OpenAI = 'openai',
    Azure = 'azure',
    Google = 'google',
    Claude = 'claude', // Anthropic
    DeepSeek = 'deepseek',
}

export type Credentials = {
    apiKey: string;
    azureEndpoint?: string;
};

class AiModelService {
    constructor() { }

    /**
     * Retrieves a list of available models from the specified AI service.
     * The API credentials are provided by the user from the frontend.
     * @param service The AI service to query.
     * @param credentials The user-provided credentials.
     * @returns A promise that resolves to an array of unified model information.
     */
    public async getModels(
        service: AiService,
        credentials: Credentials
    ): Promise<UnifiedModel[]> {
        switch (service) {
            case AiService.OpenAI:
                // This method uses the OpenAI SDK, which handles its own requests.
                return this._getOpenAIModels(credentials.apiKey);

            case AiService.DeepSeek:
                // This method also uses the OpenAI SDK.
                return this._getOpenAICompatibleModels(
                    credentials.apiKey,
                    'https://api.deepseek.com',
                    'deepseek'
                );

            case AiService.Azure:
                if (!credentials.azureEndpoint) {
                    throw new Error("Azure service requires an 'azureEndpoint' in credentials.");
                }
                // This method also uses the OpenAI SDK.
                return this._getOpenAICompatibleModels(
                    credentials.apiKey,
                    credentials.azureEndpoint,
                    'azure',
                    true
                );

            case AiService.Google:
                // This method is now updated to use fetch.
                return this._getGoogleModels(credentials.apiKey);

            case AiService.Claude:
                // This method is now updated to use fetch.
                return this._getClaudeModels(credentials.apiKey);

            default:
                throw new Error(`Service "${service}" is not supported.`);
        }
    }

    // --- Private Methods for Each Provider ---

    /**
     * Handles OpenAI and other OpenAI-compatible APIs using the official SDK.
     * This part does NOT need to change as it doesn't use axios directly.
     */
    private async _getOpenAICompatibleModels(
        apiKey: string,
        baseURL: string,
        provider: string,
        isAzure: boolean = false
    ): Promise<UnifiedModel[]> {
        try {
            const config: any = { apiKey, baseURL };
            if (isAzure) {
                config.defaultHeaders = { 'api-key': apiKey };
                config.apiKey = 'unused-in-azure-auth';
            }
            const client = new OpenAI(config);
            const list = await client.models.list();

            return list.data.map(model => ({
                id: model.id,
                ownedBy: model.owned_by,
                provider: provider,
            }));
        } catch (error) {
            console.error(`Error fetching models from ${provider}:`, error);
            throw new Error(`Failed to retrieve models from ${provider}.`);
        }
    }

    private _getOpenAIModels(apiKey: string): Promise<UnifiedModel[]> {
        return this._getOpenAICompatibleModels(
            apiKey,
            'https://api.openai.com/v1',
            'openai'
        );
    }

    /**
     * Fetches models from Google's API using the built-in `fetch`.
     */
    private async _getGoogleModels(apiKey: string): Promise<UnifiedModel[]> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                // Try to get more details from the response body on error
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                const errorMsg = (errorBody as { error?: { message?: string } })?.error?.message || 'Unknown error';
                throw new Error(`Google API request failed with status ${response.status}: ${errorMsg}`);
            }

            const data = await response.json() as { models?: any[] };
            console.log(data)
            if (!data.models) return [];

            return data.models.map((model: any) => ({
                id: model.name.replace('models/', ''),
                provider: 'google',
                ownedBy: 'google',
                displayName: model.displayName ?? '',
                description: model.description ?? '',
            }));
        } catch (error) {
            console.error('Error fetching Google models:', error);
            throw new Error('Failed to retrieve models from Google.');
        }
    }

    /**
     * Fetches models from Anthropic's API (Claude) using the built-in `fetch`.
     */
    private async _getClaudeModels(apiKey: string): Promise<UnifiedModel[]> {
        const url = 'https://api.anthropic.com/v1/models';
        const headers = {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        };

        try {
            const response = await fetch(url, { method: 'GET', headers: headers });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                const errorMsg = (errorBody as { error?: { message?: string } })?.error?.message || 'Unknown error';
                throw new Error(`Claude API request failed with status ${response.status}: ${errorMsg}`);
            }

            const data = await response.json() as { data: any[] };

            return data.data.map((model: any) => ({
                id: model.id,
                provider: 'claude',
                ownedBy: 'anthropic',
            }));
        } catch (error) {
            console.error('Error fetching Claude models:', error);
            throw new Error('Failed to retrieve models from Claude (Anthropic).');
        }
    }
}

export default new AiModelService();