import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

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

export const isBpmnByIdExists = async (id) => {
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