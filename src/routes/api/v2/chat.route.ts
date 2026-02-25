// src/routes/api/v2/chat.route.ts
import express, { Router, Request, Response } from "express";
import {
  validateChatRequest,
  chatRateLimiter,
} from "../../../middlewares/api/v2/chat.middleware.js";
import ChatController from "../../../controllers/api/v2/chat.controller.js";

const router: Router = express.Router();

// POST /api/v2/chat
router.post(
  "/chat",
  chatRateLimiter,
  validateChatRequest,
  ChatController.handleChatMessage,
);

export default router;
