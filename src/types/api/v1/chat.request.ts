import { Request } from 'express';
import { ValidatedChatRequestBody } from '../../../middlewares/api/v1/chat.middleware';

export interface ChatRequest extends Request {
    body: ValidatedChatRequestBody;
}