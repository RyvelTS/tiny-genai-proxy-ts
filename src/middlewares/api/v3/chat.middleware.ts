import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import logger from '../../../utils/logger.js';

// The keyGenerator function
const ipKeyGenerator = (req: Request, _res: Response): string => {
    if (!req.ip) {
        logger.warn('Request IP is undefined. Rate limiting might not work as expected. Check "trust proxy" Express setting.')
        return 'unknown_ip_for_rate_limit_key';
    }

    logger.info('Received from ' + req.ip)
    return req.ip;
};

export const chatRateLimiter = rateLimit({
    windowMs: 60000, // 1 minutes
    max: 5,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: ipKeyGenerator,
});

// --- Zod schema defined here ---
const chatRequestSchema = z.object({
    model: z.string(),
    instructions: z.string().optional(),
    messages: z.array(
        z.object({
            role: z.enum(['system', 'user', 'assistant']),
            content: z.string(),
        })
    ),
    stream: z.boolean().optional(),
});

export type ValidatedChatRequestBody = z.infer<typeof chatRequestSchema>;

export function validateChatRequest(req: Request, res: Response, next: NextFunction): void | Promise<void> {
    try {
        const validatedData = chatRequestSchema.parse(req.body);
        req.body = validatedData;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: 'Validation failed',
                details: error.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
            });
            return;
        }

        logger.error("Unexpected error in validateChatRequest:", error);
        res.status(500).json({ error: 'Internal server error during validation' });
        return;
    }
}