# Tiny GenAI Proxy TS

A lightweight TypeScript proxy server for multiple **AI providers** (Google Gemini, OpenAI, Azure OpenAI, Claude, DeepSeek), built with **Express** and deployable via **Vercel**. This project provides a secure API layer that abstracts away provider-specific details while keeping sensitive API keys out of client-side code.

## 🚀 Overview

This proxy server enables you to use multiple AI models from different providers through a unified interface. It supports three API versions with increasing capabilities:

- **v1**: Basic Gemini-only chat with fixed environment-based API key
- **v2**: Enhanced Gemini chat with configuration options
- **v3**: Multi-service support (OpenAI, Azure, Google, Claude, DeepSeek) with dynamic API keys via headers

The server also includes a simple web interface at the root path showing deployment status.

Ideal for developers who want to integrate multiple AI providers into their applications without maintaining complex backend integrations.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## ✨ Features

### Core Features
- 🔐 **Secure API Key Handling**: Never expose API keys in client-side code
- 🔄 **Multi-Provider Support**: Unified interface for Google Gemini, OpenAI, Azure OpenAI, Claude, and DeepSeek
- 🚀 **Three API Versions**: Gradual migration path with backward compatibility
- ⚡ **Performance Optimized**: Built with Express and efficient request handling
- 💻 **TypeScript Support**: Full type safety and excellent developer experience

### v3 API Features
- 🔑 **Dynamic API Keys**: Pass provider keys via request headers
- 🧩 **JSON Schema Support**: Force structured JSON responses with schema validation
- 📋 **Model Discovery**: List available models from each provider
- 🔧 **Flexible Configuration**: Per-request model and parameter selection
- 🌐 **CORS Support**: Configurable CORS policies for web applications

### Deployment & Operations
- ☁️ **Vercel Ready**: Zero-config deployment with serverless functions
- 📊 **Built-in Monitoring**: Server status page with environment indicators
- ⚙️ **Environment-Based Configuration**: Separate configs for development, testing, and production
- 🧪 **Comprehensive Testing**: Full test coverage with Jest

---

## 📦 Prerequisites

Before getting started, ensure you have:

- **API Keys** for any providers you plan to use:
  - Google Gemini API key (from [Google AI Studio](https://makersuite.google.com/app/apikey))
  - OpenAI API key (from [OpenAI Platform](https://platform.openai.com/api-keys))
  - Claude API key (from [Anthropic Console](https://console.anthropic.com/))
  - DeepSeek API key (from [DeepSeek Platform](https://platform.deepseek.com/))
  - Azure OpenAI endpoint and key (from [Azure Portal](https://portal.azure.com/))
- Node.js 18.x or newer
- npm or yarn package manager
- Vercel CLI (for deployment)

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/RyvelTS/tiny-genai-proxy-ts.git
cd tiny-genai-proxy-ts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file at the root of the project with the following variables:

```env
# Required for v1/v2 Gemini endpoints
GEMINI_API_KEY=your_google_gemini_api_key

# Optional: Set default Gemini model (v1/v2)
GEMINI_DEFAULT_MODEL=gemini-2.0-flash

# Optional: Set evaluation model for safety checks
GEMINI_EVALUATION_MODEL=gemini-2.0-flash

# Web interface configuration
APP_NAME=Tiny GenAI Proxy
ENVIRONMENT=development

# CORS configuration (use "*" for all origins or specific URL)
ALLOWED_ORIGIN=*

# Logging level (debug, info, warn, error)
LOG_LEVEL=info

# Note: API v3 endpoints use headers (X-API-Key, X-Azure-Endpoint) for API keys
# instead of environment variables. See v3 API documentation for details.
```

> ⚠️ **Security Note**: Never commit `.env` files. Ensure `.env` is in your `.gitignore`.

For testing, create a `.env.test` file:

```env
GEMINI_API_KEY=test_api_key_placeholder
LOG_LEVEL=warn
```

---

## ▶️ Running Locally

### Development Server

Start the development server with Vercel's development tools:

```bash
npm run dev
```

The server will be available at: `http://localhost:3000`

### Production Build

Build and run the TypeScript project:

```bash
npm run build
npm start
```

### Access Points

- **Web Interface**: `http://localhost:3000` - Shows server status and environment info
- **API Base**: `http://localhost:3000/api`
- **API Documentation**: See sections below for specific endpoints

---

## 📚 API Documentation

### API Version Overview

| Version | Description | Key Features |
|---------|-------------|--------------|
| **v1** | Basic Gemini chat | Fixed API key, simple interface, rate limiting |
| **v2** | Enhanced Gemini chat | Additional configuration options, improved error handling |
| **v3** | Multi-provider unified API | Dynamic API keys, JSON schema support, model discovery |

### Web Interface

**GET /** - Application Status Page
- Returns an HTML page showing server status and environment information
- If `ALLOWED_ORIGIN` is set to a specific URL (not "*"), redirects to that URL
- Displays `APP_NAME` and `ENVIRONMENT` from environment variables

### API v1 - Basic Gemini Chat

#### POST `/api/v1/chat`
Basic chat endpoint for Gemini models using environment-based API key.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "systemPrompt": "You are a helpful assistant.",
  "conversationHistory": [
    { "role": "user", "parts": ["Hello!"] },
    { "role": "assistant", "parts": ["Hi there! How can I help you today?"] }
  ],
  "newUserMessage": "Can you tell me a joke?",
  "modelName": "gemini-2.0-flash-exp"
}
```

**Response:**
```json
{
  "response": "Why don't scientists trust atoms? Because they make up everything!"
}
```

**Alternative endpoint:** `POST /api/v1/open-ai-chat` (same functionality)

### API v2 - Enhanced Gemini Chat

#### POST `/api/v2/chat`
Enhanced Gemini chat with additional configuration options.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "systemPrompt": "You are a technical assistant specializing in programming.",
  "conversationHistory": [
    { "role": "user", "parts": ["Explain binary search"] }
  ],
  "newUserMessage": "Now implement it in Python",
  "modelName": "gemini-2.0-flash",
  "config": {
    "temperature": 0.7,
    "maxOutputTokens": 1000
  }
}
```

**Response:**
```json
{
  "response": "Here's a Python implementation of binary search...",
  "safetyRatings": {
    "harassment": "NEGLIGIBLE",
    "hateSpeech": "NEGLIGIBLE"
  }
}
```

### API v3 - Multi-Provider Unified API

#### POST `/api/v3/chat`
Unified chat endpoint supporting multiple AI providers.

**Headers:**
```
Content-Type: application/json
X-API-Key: your_provider_api_key_here
X-Azure-Endpoint: https://your-resource.openai.azure.com/ (for Azure only)
```

**Request Body:**
```json
{
  "service": "openai",  // "openai", "azure", "google", "claude", "deepseek"
  "model": "gpt-4-turbo",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Explain quantum computing in simple terms." }
  ],
  "schema": {
    "type": "object",
    "properties": {
      "explanation": { "type": "string" },
      "keyPoints": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["explanation", "keyPoints"]
  }
}
```

**Response:**
```json
{
  "id": "chatcmpl-123",
  "content": "{\"explanation\":\"Quantum computing uses qubits...\",\"keyPoints\":[\"Point 1\",\"Point 2\"]}",
  "model": "gpt-4-turbo",
  "provider": "openai"
}
```

**Notes:**
- `X-API-Key` header is required for all services
- `X-Azure-Endpoint` is required for Azure OpenAI
- `schema` field is optional; when provided, forces JSON response
- `service` must be one of: `openai`, `azure`, `google`, `claude`, `deepseek`

#### GET `/api/v3/models`
List available models from a provider.

**Query Parameters:**
- `service` (required): AI service name
- `endpoint` (optional): Azure endpoint URL (for Azure only)

**Headers:**
```
X-API-Key: your_provider_api_key_here
```

**Example Request:**
```
GET /api/v3/models?service=openai
```

**Response:**
```json
[
  {
    "id": "gpt-4-turbo",
    "provider": "openai",
    "ownedBy": "openai"
  },
  {
    "id": "gpt-4",
    "provider": "openai",
    "ownedBy": "openai"
  }
]
```

---

## 🧪 Testing

This project includes comprehensive test coverage for controllers, middleware, and service logic using **Jest**.

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Environment

Tests use a separate `.env.test` file for environment variables. The test setup includes:
- Mocked API calls to avoid hitting real endpoints
- Comprehensive unit tests for all major components
- Integration tests for API endpoints
- Error handling and edge case coverage

---

## 🚀 Deployment with Vercel

### 1. Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### 2. Deploy Your Project

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 3. Set Environment Variables on Vercel

```bash
# Set individual variables
vercel env add GEMINI_API_KEY production
vercel env add ALLOWED_ORIGIN production
vercel env add APP_NAME production
vercel env add ENVIRONMENT production

# Or set all variables from your .env file
vercel env pull .env.production
```

### 4. Access Your Deployed Application

After deployment, your proxy will be accessible at:
- Web Interface: `https://your-vercel-project.vercel.app`
- API Base: `https://your-vercel-project.vercel.app/api`

---

## 📋 Postman Collection

A ready-to-use Postman collection is included in the repository at [`Tiny-GenAI-Proxy-API.postman_collection.json`](./Tiny-GenAI-Proxy-API.postman_collection.json). This comprehensive collection includes pre-configured requests for all API versions and supported AI providers.

### Collection Contents

The collection includes the following requests:

#### Web Interface
- **Web Interface**: GET request to the root path (`/`) to view server status

#### API v1 - Basic Gemini Chat
- **API v1 - Basic Gemini Chat**: POST request to `/api/v1/chat` with simple Gemini chat

#### API v2 - Enhanced Gemini Chat  
- **API v2 - Enhanced Gemini Chat**: POST request to `/api/v2/chat` with configuration options

#### API v3 - Multi-Provider Chat
- **API v3 - OpenAI Chat**: POST request to `/api/v3/chat` for OpenAI models
- **API v3 - OpenAI Chat with JSON Schema**: Example with JSON schema for structured responses
- **API v3 - Google Gemini Chat**: POST request for Google Gemini models
- **API v3 - Azure OpenAI Chat**: POST request for Azure OpenAI (requires endpoint header)
- **API v3 - Claude Chat**: POST request for Anthropic Claude models
- **API v3 - DeepSeek Chat**: POST request for DeepSeek models

#### API v3 - Model Discovery
- **API v3 - List OpenAI Models**: GET request to `/api/v3/models` for OpenAI
- **API v3 - List Google Models**: GET request for Google Gemini models
- **API v3 - List Azure Models**: GET request for Azure OpenAI models (with endpoint parameter)

### Features Included

- **Pre-configured Environment Variables**: Variables for `baseUrl` and all provider API keys
- **Test Scripts**: Basic test scripts to verify successful responses
- **Pre-request Scripts**: Logging for debugging requests
- **Detailed Descriptions**: Each request includes usage notes and requirements
- **JSON Schema Examples**: Demonstrates structured output generation

### Using the Collection

1. **Locate the collection file**: `Tiny-GenAI-Proxy-API.postman_collection.json` in the project root
2. **Open Postman** and click "Import"
3. **Select the JSON file** or drag and drop it into Postman
4. **Set environment variables** in Postman:
   - `baseUrl`: Your server URL (`http://localhost:3000` for local, or your Vercel URL for production)
   - Provider API keys: Set the appropriate variables for each provider:
     - `openai_api_key`: Your OpenAI API key
     - `google_api_key`: Your Google Gemini API key  
     - `azure_api_key`: Your Azure OpenAI API key
     - `azure_endpoint`: Your Azure OpenAI endpoint URL
     - `claude_api_key`: Your Claude API key
     - `deepseek_api_key`: Your DeepSeek API key

5. **Start testing**: Select any request, ensure environment variables are set, and send requests

---


## 🔧 Configuration Details

### CORS Configuration

The server supports configurable CORS policies via the `ALLOWED_ORIGIN` environment variable:

- Set to `*` to allow all origins (not recommended for production)
- Set to a specific URL (e.g., `https://your-app.com`) to restrict access
- If set to a specific URL and a request comes to the root path, it will redirect to that URL

### Rate Limiting

All API versions (v1, v2, and v3) include built-in rate limiting to prevent abuse:
- Default limit: 5 requests per minute per IP (configurable in middleware)
- Based on client IP address with proper proxy support
- Customizable via middleware configuration for different deployment needs

### Logging

Logging is configured via the `LOG_LEVEL` environment variable:
- `debug`: Verbose logging for development
- `info`: Standard operational logging
- `warn`: Warning and error messages only
- `error`: Error messages only

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

---

## 📄 License

This project is licensed under the ISC License.

---

## 📬 Support & Feedback

- **Issues**: Open an issue on GitHub
- **Feature Requests**: Submit via GitHub issues
- **Questions**: Check existing issues or open a new one

---

## 🔗 Related Projects

- [Google Generative AI SDK](https://github.com/google/generative-ai-js) - Official Google Gemini SDK
- [OpenAI Node.js Library](https://github.com/openai/openai-node) - Official OpenAI Node.js library
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) - Official Claude SDK

---