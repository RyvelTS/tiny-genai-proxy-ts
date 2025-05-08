import express from 'express';
import dotenv from 'dotenv';
import path from 'path'; // For path manipulation
import fs from 'fs';     // For file system operations
import chatHandler from './api/chat';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { validateChatRequest, chatRateLimiter } from './api/middleware';

dotenv.config();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    if (!allowedOrigin) {
        res.sendStatus(500).json({ error: 'CORS_ALLOW_ORIGIN is not set.' });
        return;
    }
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'GET route is working!' });
});

app.post('/api/chat', chatRateLimiter, validateChatRequest, (req, res) => {
    Promise.resolve(chatHandler(req, res)).catch(err => {
        console.error('Unhandled error in /api/chat:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/', (req, res) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;

    if (allowedOrigin) {
        return res.redirect(302, allowedOrigin);
    }

    const appName = process.env.APP_NAME || 'Tiny GenAI Proxy';
    const envName = process.env.ENVIRONMENT || 'Unknown';

    const filePath = path.join(process.cwd(), 'public', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read index.html:', err);
            return res.status(500).send('Internal Server Error loading page.');
        }

        let updatedHtml = data.replace(/{{APP_NAME}}/g, appName);
        updatedHtml = updatedHtml.replace(/{{ENVIRONMENT_NAME}}/g, envName);

        res.setHeader('Content-Type', 'text/html');
        res.send(updatedHtml);
    });
});

export default app;