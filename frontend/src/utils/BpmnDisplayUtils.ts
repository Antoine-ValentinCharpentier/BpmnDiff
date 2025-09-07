import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import { diff as diffBpmnXml, type DiffResult } from 'bpmn-js-differ';
import { loadModel } from "./BpmnModdleUtils";

export const CLASS_ELEMENT_ADDED = 'diff-added';
export const CLASS_ELEMENT_UPDATED = 'diff-changed';
export const CLASS_ELEMENT_DELETED = 'diff-removed';
export const CLASS_LAYOUT_CHANGED = 'diff-layout-changed';

export const setupViewer = async (viewerRef: React.RefObject<HTMLDivElement | null>, xml?: string) => {
    if (!viewerRef.current || !xml) return;

    const viewer = new NavigatedViewer({
        container: viewerRef.current,
        height: "100%",
        width: "100%",
    });

    try {
        await viewer.importXML(xml);
    } catch (err) {
        console.error("BPMN load error:", err);
    }

    return viewer;
};

export const syncViewersViewbox = (
  viewerLeft: NavigatedViewer | undefined,
  viewerRight: NavigatedViewer | undefined
) => {
  if (!viewerLeft || !viewerRight) return;

  let isSyncing = false;

  const syncHandler = (source: NavigatedViewer, target: NavigatedViewer) => {
    return () => {
      if (isSyncing) return;

      isSyncing = true;

      const sourceCanvas = source.get('canvas') as Canvas;
      const targetCanvas = target.get('canvas') as Canvas;

      targetCanvas.viewbox(sourceCanvas.viewbox());

      isSyncing = false;
    };
  };

  viewerLeft.on('canvas.viewbox.changed', syncHandler(viewerLeft, viewerRight));
  viewerRight.on('canvas.viewbox.changed', syncHandler(viewerRight, viewerLeft));
};

export const calcDiff = async (xmlBefore:string,xmlAfter:string) => {
  const bpmnBefore = await loadModel(xmlBefore);
  const bpmnAfter = await loadModel(xmlAfter);

  const diffJson = diffBpmnXml(bpmnBefore, bpmnAfter);

  return diffJson;
}

export const displayOverlayDiff = (viewerOld : NavigatedViewer, viewerNew : NavigatedViewer, diffJson : DiffResult) => {
  Object.entries(diffJson._removed || {}).forEach(([id, _]) => {
    highlightElement(viewerOld, id, CLASS_ELEMENT_DELETED);
  });

  Object.entries(diffJson._added || {}).forEach(([id, _]) => {
    highlightElement(viewerNew, id, CLASS_ELEMENT_ADDED);
  });

  Object.entries(diffJson._layoutChanged || {}).forEach(([id]) => {
    highlightElement(viewerOld, id, CLASS_LAYOUT_CHANGED);
    highlightElement(viewerNew, id, CLASS_LAYOUT_CHANGED);
  });

  Object.entries(diffJson._changed || {}).forEach(([id, obj]) => {
    const details = Object.entries(obj.attrs).map(([attr, ch]) =>
      `<tr><td>${attr}</td><td>${ch.oldValue}</td><td>${ch.newValue}</td></tr>`
    ).join('');

    const table = `<table><tr><th>Attribute</th><th>Old</th><th>New</th></tr>${details}</table>`;
    addOverlay(viewerOld, id, `<div id="changeDetailsOld_${id}" class="changeDetails">${table}</div>`);
    addOverlay(viewerNew, id, `<div id="changeDetailsNew_${id}" class="changeDetails">${table}</div>`);

    highlightElement(viewerOld, id, CLASS_ELEMENT_UPDATED);
    highlightElement(viewerNew, id, CLASS_ELEMENT_UPDATED);
  });
}

const highlightElement = (viewer:NavigatedViewer, id: string, cls: string) => {
  const canvas = viewer.get('canvas') as Canvas;
  canvas.addMarker(id, cls);
  addMarker(viewer, id, cls);
}

const unhighlightElement = (viewer:NavigatedViewer, id: string, cls: string) => {
  const canvas = viewer.get('canvas') as Canvas;
  canvas.removeMarker(id, cls);
}

export const highlightAllElements = (viewer: NavigatedViewer, cls: string) => {
  const elementRegistry = viewer.get('elementRegistry') as ElementRegistry;
  const allElements = elementRegistry.getAll();
  allElements.forEach(el => {
    if (el.type === "bpmn:Process") return;
    highlightElement(viewer, el.id, cls)
  });
};

const addMarker = (viewer:NavigatedViewer, id: string, cls: string) => {
  let cls_marker = '';
  let symbol = '';
  switch (cls) {
    case CLASS_ELEMENT_ADDED:
      cls_marker = 'marker-added';
      symbol = '+';
      break;
    case CLASS_ELEMENT_DELETED:
      cls_marker = 'marker-removed';
      symbol = '−';
      break;
    case CLASS_ELEMENT_UPDATED:
      cls_marker = 'marker-changed';
      symbol = '✎';
      break;
    case CLASS_LAYOUT_CHANGED:
      cls_marker = 'marker-layout-changed';
      symbol = '→';
      break;
    default:
      break;
  }
  const overlays = viewer.get('overlays') as Overlay;
  try {
    overlays.add(id, 'diff', {
      position: { top: -12, right: 12 },
      html: `<span class="marker ${cls_marker}">${symbol}</span>`
    });
  } catch (e) {}
}

const addOverlay = (viewer:NavigatedViewer, id: string, html: string) => {
  const overlays = viewer.get('overlays') as Overlay;
  overlays.add(id, 'diff', {
    position: { bottom: -5, left: 0 },
    html
  });
}