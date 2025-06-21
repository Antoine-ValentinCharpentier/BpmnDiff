import express from 'express';
import multer from 'multer';
import * as controller from '../controllers/bpmn.controller.js';

const router = express.Router();
const upload = multer();

router.post('/upload', upload.array('files', 2), controller.uploadBpmn);

export default router;
