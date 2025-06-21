import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import BpmnFile from '../models/bpmn.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../../uploads');

export const saveBpmnFiles = async (bpmnBefore, bpmnAfter) => {
  const id = uuidv4();

  const filenameBefore = `${id}_before.bpmn`;
  const filenameAfter = `${id}_after.bpmn`;

  await fs.writeFile(path.join(uploadDir, filenameBefore), bpmnBefore.buffer);
  await fs.writeFile(path.join(uploadDir, filenameAfter), bpmnAfter.buffer);

  await BpmnFile.create({ id, nameBpmnBefore: filenameAfter, nameBpmnAfter: filenameAfter });

  return `/diff/${id}`;
};