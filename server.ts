import express from 'express';
import dotenv from 'dotenv';
import path from 'path'; // For path manipulation
import fs from 'fs';     // For file system operations
import chatHandler from './api/chat';
import { SpeedInsights } from "@vercel/speed-insights/next"

// Load environment variables from .env file (important for local dev)
dotenv.config();

const app = express();
app.use(express.json());

// Add CORS headers to all responses and handle preflight OPTIONS requests
app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    console.log('CORS_ALLOW_ORIGIN:', allowedOrigin);
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

app.post('/api/chat', (req, res) => {
    Promise.resolve(chatHandler(req, res)).catch(err => {
        console.error('Unhandled error in /api/chat:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Route for '/' to display the environment
app.get('/', (req, res) => {
    const environment = process.env.ENVIRONMENT || 'unknown'; // Default to 'unknown' if not set

    // Path to your HTML file.
    // process.cwd() gives the root of your project where package.json is.
    // This assumes you've created a 'public' folder in your project root
    // and 'environment_page.html' is inside it.
    const htmlFilePath = path.join(process.cwd(), 'public', 'index.html');

    fs.readFile(htmlFilePath, 'utf8', (err, htmlData) => {
        if (err) {
            console.error('Error reading HTML file:', htmlFilePath, err);
            return res.status(500).send('Error: Could not load the page template.');
        }

        // Determine class for styling based on environment
        let envClass = 'env-unknown';
        if (environment.toLowerCase() === 'dev') {
            envClass = 'env-dev';
        } else if (environment.toLowerCase() === 'prod') {
            envClass = 'env-prod';
        }

        // Replace placeholders with actual values
        // Basic XSS protection by escaping HTML special characters for the value
        const escapedEnvironmentValue = environment
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, "")
            .replace(/'/g, "'");

        let modifiedHtml = htmlData.replace('{{ENVIRONMENT_VALUE_PLACEHOLDER}}', escapedEnvironmentValue);
        modifiedHtml = modifiedHtml.replace('{{ENVIRONMENT_CLASS_PLACEHOLDER}}', envClass);


        res.setHeader('Content-Type', 'text/html');
        res.send(modifiedHtml);
    });
});

// Export the Express app for Vercel
export default app;