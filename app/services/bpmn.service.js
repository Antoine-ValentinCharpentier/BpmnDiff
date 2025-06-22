import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { diff as diffBpmnXml } from 'bpmn-js-differ';
import BpmnModdle from 'bpmn-moddle';
import { escape } from 'querystring';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');
const viewsDir = path.join(__dirname, '../views');
fs.mkdir(uploadDir, { recursive: true });

export const saveBpmnFiles = async (bpmnBefore, bpmnAfter) => {
  const id = uuidv4();

  const filenameBefore = `${id}_before.bpmn`;
  const filenameAfter = `${id}_after.bpmn`;

  await fs.writeFile(path.join(uploadDir, filenameBefore), bpmnBefore.buffer);
  await fs.writeFile(path.join(uploadDir, filenameAfter), bpmnAfter.buffer);

  return id;
};

export const getDiffHtml = async (id) => {
  const xmlBefore = await fs.readFile(path.join(uploadDir, `${id}_before.bpmn`), 'utf-8');
  const xmlAfter = await fs.readFile(path.join(uploadDir, `${id}_after.bpmn`), 'utf-8');

  const bpmnBefore = await loadModel(xmlBefore);
  const bpmnAfter = await loadModel(xmlAfter);

  const diff = diffBpmnXml(bpmnBefore, bpmnAfter);

  const template = await fs.readFile(path.join(viewsDir, 'diffTemplate.view.html'), 'utf-8');

  const populated = template
    .replace('{{xmlA}}', xmlBefore)
    .replace('{{xmlB}}', xmlAfter)
    .replace('{{diffJson}}', JSON.stringify(diff));

  console.log(populated)

  return populated;
};

export const checkIfBpmnByIdExists = async (id) => {
  await fs.access(path.join(uploadDir, `${id}_before.bpmn`));
  await fs.access(path.join(uploadDir, `${id}_after.bpmn`));
};

export const deleteBpmnById = async (id) => {
  await fs.unlink(path.join(uploadDir, `${id}_before.bpmn`));
  await fs.unlink(path.join(uploadDir, `${id}_after.bpmn`));
};

export const deleteAllBpmn = async () => {
  await fs.rm(uploadDir, { recursive: true, force: true });
  await fs.mkdir(uploadDir, { recursive: true });
}

async function loadModel(diagramXML) {
  const bpmnModdle = new BpmnModdle();
  const { rootElement: definitionsA } = await bpmnModdle.fromXML(diagramXML);
  return definitionsA;
}