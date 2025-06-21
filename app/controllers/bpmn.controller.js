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

    const id = await service.saveBpmnFiles(bpmnBefore, bpmnAfter);

    res.status(201).send(id);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteById = async (req, res) => {
  const { id } = req.params;

  try {
    await service.isBpmnByIdExists(id)
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'Fichiers BPMN introuvables.' });
    }
    return res.status(500).json({ error: err.message });
  }

  try {
    await service.deleteBpmnById(id);
    res.status(200).json({ message: "Fichiers supprimés." });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
  
};

export const deleteAll = async (req, res) => {
  try {
    await service.deleteAllBpmn();
    res.status(200).json({ message: "Fichiers supprimés." });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};