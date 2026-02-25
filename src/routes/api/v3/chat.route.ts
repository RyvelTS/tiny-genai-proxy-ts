// src/routes/api/v2/chat.route.ts
import express, { Router } from "express";
import {
  validateChatRequest,
  chatRateLimiter,
} from "../../../middlewares/api/v3/chat.middleware.js";
import ChatController from "../../../controllers/api/v3/chat.controller.js";

const router: Router = express.Router();

// POST /api/v3/chat
router.post(
  "/chat",
  chatRateLimiter,
  validateChatRequest,
  ChatController.handleChatMessage,
);

// GET /api/v3/models
router.get("/models", chatRateLimiter, ChatController.getAvailableModels);

export default router;
