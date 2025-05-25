import express, { Router } from 'express';
import AppController from '../../controllers/web/app.controller.js';


const router: Router = express.Router();

router.get('/', AppController.serveIndexPage);

export default router;