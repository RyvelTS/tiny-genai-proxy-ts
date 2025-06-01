# Tiny GenAI Proxy TS

A lightweight TypeScript proxy server for the **Google Gemini API**, built with **Express** and deployable via **Vercel**. This project allows you to securely expose a minimal API layer in front of Gemini models, while keeping sensitive keys out of client-side code.

## 🚀 Overview

This proxy server was created to make it easier to use **Google Gemini AI models** in frontend applications without exposing your API key. It wraps the Gemini REST API endpoints with a simple Express-based middleware and can be deployed instantly with **Vercel**.

Ideal for developers who want to integrate Gemini into their apps using a secure backend proxy but don’t want to maintain a full backend service.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

## ✨ Features

- 🔐 **Secure API Key Handling**: Never expose your Gemini API key in client-side code.
- ⚡ **Fast & Lightweight**: Built with Express and optimized for performance.
- 💻 **TypeScript Support**: Strong typing for better developer experience.
- ☁️ **Vercel Ready**: Deploy easily with zero-config or custom domains.
- 🧩 **Simple Interface**: Minimal wrapper around the Gemini API for easy integration.

---

## 📦 Prerequisites

Before getting started, ensure you have:

- A **Google Gemini API key** (get one [Google AI Studio](https://makersuite.google.com/app/apikey))
- Node.js installed (18.x or newer)
- npm or yarn installed
- Vercel CLI (for deployment)

---

## 🛠️ Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/RyvelTS/tiny-genai-proxy-ts.git
cd tiny-genai-proxy-ts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file at the root of the project:

```env
GEMINI_API_KEY=your-google-gemini-api-key
```

> ⚠️ Never commit this file. Add it to your `.gitignore`.

---

## ▶️ Running Locally

Start the development server:

```bash
npm run dev
```

The proxy will be available at:
👉 `http://localhost:3000/api/v1/chat`

---

## 🌐 Example Request

Send a POST request to the proxy endpoint:

```JSON
{
  "systemPrompt": "You are a helpful assistant.",
  "conversationHistory": [
    { "role": "user", "parts": ["Hello!"] }
  ],
  "newUserMessage": "Can you tell me a joke?",
  "modelName": "gemini-2.0-flash-exp"
}
```

It will forward the request to the Gemini API and return the response back to your client.

---

## 🚀 Deployment with Vercel

To deploy:

1. Install the Vercel CLI (if not already):

   ```bash
   npm install -g vercel
   ```

2. Deploy your project:

   ```bash
   vercel
   ```

3. Set environment variables on Vercel:

   ```bash
   vercel env add GEMINI_API_KEY production
   ```

4. After deployment, your proxy will be accessible at:
   👉 `https://your-vercel-project.vercel.app/api/v1/chat`

---

## 🧪 Testing

This project includes comprehensive test coverage for controllers, middleware, and Gemini service logic. Tests are written with **Jest** and cover:

- Controller request/response handling, including error and validation scenarios
- Middleware input validation for chat requests
- Gemini service integration, including prompt safety evaluation and error handling

### Running tests

```bash
npm test
```

Test setup uses a `.env.test` file for environment variables. See `tests/jest.setup.ts` for details.

---

## 📬 Feedback

Have a feature idea or found a bug? Open an issue or reach out on GitHub!

