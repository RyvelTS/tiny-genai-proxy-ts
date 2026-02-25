// src/routes/api/v1/chat.route.ts
import express, { Router, Request, Response } from "express";
import {
  validateChatRequest,
  chatRateLimiter,
} from "../../../middlewares/api/v1/chat.middleware.js";
import ChatController from "../../../controllers/api/v1/chat.controller.js";

const router: Router = express.Router();

// POST /api/v1/chat
router.post(
  "/chat",
  chatRateLimiter,
  validateChatRequest,
  ChatController.handleChatMessage,
);

router.post(
  "/open-ai-chat",
  chatRateLimiter,
  validateChatRequest,
  ChatController.handleChatMessage,
);

export default router;
