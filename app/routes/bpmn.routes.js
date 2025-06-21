import express from 'express';
import * as controller from '../controllers/bpmn.controller.js';
import { uploadBpmnMiddleware } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post('/upload', uploadBpmnMiddleware, controller.uploadBpmn);
router.delete('/delete/:id', controller.deleteById);
router.delete('/delete', controller.deleteAll);

export default router;
