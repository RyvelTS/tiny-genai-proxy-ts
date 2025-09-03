import express, { Router, Request, Response } from 'express';
import v1ChatRouter from './v1/chat.route.js';
import v2ChatRouter from './v2/chat.route.js';
import v3ChatRouter from './v3/chat.route.js';

const router: Router = express.Router();

// Mount v1 routes under /api/v1
router.use('/v1', v1ChatRouter);

// Mount v2 routes under /api/v2
router.use('/v2', v2ChatRouter);

// Mount v3 routes under /api/v3
router.use('/v3', v3ChatRouter);

export default router;