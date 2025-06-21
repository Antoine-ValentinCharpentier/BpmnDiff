import * as service from '../services/bpmn.service.js';

export const uploadBpmn = async (req, res) => {
  try {
    const [bpmnBefore, bpmnAfter] = req.files;
    const url = await service.saveBpmnFiles(bpmnBefore, bpmnAfter);
    res.send(url);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};