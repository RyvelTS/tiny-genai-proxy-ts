import { Request } from "express";
import { ValidatedChatRequestBody } from "../../../middlewares/api/v3/chat.middleware";

export interface ChatRequest extends Request {
  body: ValidatedChatRequestBody;
}
