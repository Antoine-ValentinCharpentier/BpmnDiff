import * as service from '../services/bpmn.service.js';
import * as serviceVite from '../services/vite.service.js';

export const test = async (req, res) => {
  res.send("test");
};

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

export const showDiff = async (req, res) => {
  const { id } = req.params;

  try {
    const { templateHtml, data: dataBpmn } = await service.getDiffTemplateData(id);
    const dataServerVite = serviceVite.getAssets();
    res.render(templateHtml, {...dataBpmn, ...dataServerVite});
  } catch (err) {
    res.status(404).send('Diff not found'+err);
  }
}

export const deleteById = async (req, res) => {
  const { id } = req.params;

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