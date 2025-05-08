import express from 'express';
import chatHandler from './api/chat';

const app = express();
app.use(express.json());

app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'GET route is working!' });
});

app.post('/api/chat', (req, res) => {
    // Forward the request and response to the chat handler
    // The handler expects (req, res) and returns a Promise
    // so we call it and catch any unhandled errors
    Promise.resolve(chatHandler(req, res)).catch(err => {
        console.error('Unhandled error in /api/chat:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Export the Express app for Vercel
export default app;