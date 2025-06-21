import express from 'express';
import * as controller from '../controllers/bpmn.controller.js';
import { uploadBpmnMiddleware } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post('/upload', uploadBpmnMiddleware, controller.uploadBpmn);

export default router;
