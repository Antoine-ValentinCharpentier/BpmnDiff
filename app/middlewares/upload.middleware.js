import multer from 'multer';

const upload = multer();

export const uploadBpmnMiddleware = (req, res, next) => {
    upload.fields([
      { name: 'bpmnBefore', maxCount: 1 },
      { name: 'bpmnAfter', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: `Champ de fichier non autorisé : ${err.field}` });
      }
      if (err) return res.status(500).json({ error: err.message });
      next();
    });
};