import express from 'express';
import dotenv from 'dotenv';

import apiRoutes from './src/routes/api/index.js';
import webRoutes from './src/routes/web/index.js';

dotenv.config();
const app = express();
app.use(express.json());
app.set('trust proxy', true);
app.use((req, res, next) => {
    const allowedOrigin = process.env.ALLOWED_ORIGIN;
    if (!allowedOrigin) {
        res.sendStatus(500).json({ error: 'CORS_ALLOW_ORIGIN is not set.' });
        return;
    }
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }
    next();
});

app.use('/', webRoutes);
app.use('/api', apiRoutes);

export default app;