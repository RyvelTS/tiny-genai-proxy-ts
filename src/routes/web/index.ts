import express, { Router } from 'express';
import AppController from '../../controllers/web/app.controller';


const router: Router = express.Router();

router.get('/', AppController.serveIndexPage);

export default router;