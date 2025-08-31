import BpmnModdle from "bpmn-moddle";

export async function loadModel(diagramXML: string) {
  const bpmnModdle = new BpmnModdle();
  const { rootElement: definitions } = await bpmnModdle.fromXML(diagramXML);
  return definitions;
}
