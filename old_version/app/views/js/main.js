import BpmnViewerManager from './BpmnViewerManager.js';

// import 'bpmn-js/dist/assets/diagram-js.css';
// import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
// import 'bpmn-js/dist/bpmn-navigated-viewer.css';

export async function startBpmnViewer(xmlBefore, xmlAfter, isManualMode) {
  const bpmnManager = new BpmnViewerManager("left", "right");
  if (!isManualMode) {
    await bpmnManager.loadDiagram("left", xmlBefore);
    await bpmnManager.loadDiagram("right", xmlAfter);
  }
}

const xmlBefore = window.__XML_BEFORE__;
const xmlAfter = window.__XML_AFTER__;
const isManualMode = window.__MANUAL_MODE__;

startBpmnViewer(xmlBefore, xmlAfter, isManualMode);
