import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { diff as diffBpmnXml } from 'bpmn-js-differ';
import BpmnModdle from 'bpmn-moddle';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

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
  let xmlBefore = "";
  let xmlAfter = "";
  let diff = {};

  if (id) {
    xmlBefore = await fs.readFile(path.join(uploadDir, `${id}_before.bpmn`), 'utf-8');
    xmlAfter = await fs.readFile(path.join(uploadDir, `${id}_after.bpmn`), 'utf-8');

    const bpmnBefore = await loadModel(xmlBefore);
    const bpmnAfter = await loadModel(xmlAfter);

    diff = diffBpmnXml(bpmnBefore, bpmnAfter);
  }
  
  const data = {xmlBefore, xmlAfter, diffJson:JSON.stringify(diff), manualMode: !id}

  return {templateHtml: "diffTemplate", data};
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