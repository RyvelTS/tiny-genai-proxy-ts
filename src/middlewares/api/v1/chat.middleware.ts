import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

export const chatRateLimiter = rateLimit({
    windowMs: 60000, // 1 minutes
    max: 5,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Zod schema defined here ---
const chatRequestSchema = z.object({
    systemPrompt: z.string(),
    conversationHistory: z.array(
        z.object({
            role: z.enum(["user", "assistant", "system"]),
            parts: z.array(z.string()).min(1, "Each 'parts' array in conversationHistory must contain at least one string."),
        })
    ).optional(),
    newUserMessage: z.string({ required_error: "newUserMessage is required." })
        .min(1, "newUserMessage cannot be empty."),
    modelName: z.string().optional(),
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

        console.error("Unexpected error in validateChatRequest:", error);
        res.status(500).json({ error: 'Internal server error during validation' });
        return;
    }
}