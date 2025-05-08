import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Validation middleware for chat API
export function validateChatRequest(req: Request, res: Response, next: NextFunction) {
    const { systemPrompt, conversationHistory, newUserMessage, modelName } = req.body;
    if (!newUserMessage || typeof newUserMessage !== 'string') {
        res.status(400).json({ error: 'Missing or invalid newUserMessage.' });
        return;
    }

    if (systemPrompt && typeof systemPrompt !== 'string') {
        res.status(400).json({ error: 'Invalid systemPrompt.' });
        return;
    }

    if (conversationHistory && !Array.isArray(conversationHistory)) {
        res.status(400).json({ error: 'Invalid conversationHistory.' });
        return;
    }

    if (conversationHistory && conversationHistory.some(
        (msg: any) => typeof msg !== 'object' || !msg.role || !Array.isArray(msg.parts)
    )) {
        res.status(400).json({ error: 'Invalid conversationHistory format.' });
        return;
    }

    next();
}

export const chatRateLimiter = rateLimit({
    windowMs: 60000, // 1 minutes
    max: 15,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});