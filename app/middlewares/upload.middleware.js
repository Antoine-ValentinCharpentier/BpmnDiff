import multer from 'multer';
import path from 'path';
import * as service from '../services/bpmn.service.js';

const upload = multer();

const isBpmnFile = (file) => path.extname(file.originalname).toLowerCase() === '.bpmn';

export const uploadBpmnMiddleware = (req, res, next) => {
    upload.fields([
      { name: 'bpmnBefore', maxCount: 1 },
      { name: 'bpmnAfter', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: `Champ de fichier non autorisé : ${err.field}` });
      }
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const { bpmnBefore, bpmnAfter } = req.files;

      if (bpmnBefore && (!isBpmnFile(bpmnBefore[0]))) {
        return res.status(400).json({ error: 'Le fichier "bpmnBefore" doit être au format .bpmn' });
      }

      if (bpmnAfter && (!isBpmnFile(bpmnAfter[0]))) {
        return res.status(400).json({ error: 'Le fichier "bpmnAfter" doit être au format .bpmn' });
      }

      next();
    });
};

export const checkBpmnExists = async (req, res, next) => {
  const { id } = req.params;

  try {
    await service.checkIfBpmnByIdExists(id);
    next(); 
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Fichiers BPMN introuvables.' });
    }
    return res.status(500).json({ error: err.message });
  }
};