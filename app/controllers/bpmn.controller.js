import * as service from '../services/bpmn.service.js';

export const uploadBpmn = async (req, res) => {
  try {
    const bpmnBefore = req.files?.bpmnBefore?.[0];
    const bpmnAfter = req.files?.bpmnAfter?.[0];

    if (!bpmnBefore || !bpmnAfter) {
      return res.status(400).json({
        error: 'Les deux fichiers "bpmnBefore" et "bpmnAfter" sont requis.',
      });
    }

    const url = await service.saveBpmnFiles(bpmnBefore, bpmnAfter);
    
    res.send(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};