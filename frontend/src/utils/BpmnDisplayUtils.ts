import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import { diff as diffBpmnXml, type DiffResult } from 'bpmn-js-differ';
import { loadModel } from "./BpmnModdleUtils";

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
    highlightElement(viewerOld, id, 'diff-removed');
    addMarker(viewerOld, id, 'marker-removed', '−');
  });

  Object.entries(diffJson._added || {}).forEach(([id, _]) => {
    highlightElement(viewerNew, id, 'diff-added');
    addMarker(viewerNew, id, 'marker-added', '+');
  });

  Object.entries(diffJson._layoutChanged || {}).forEach(([id]) => {
    highlightElement(viewerOld, id, 'diff-layout-changed');
    highlightElement(viewerNew, id, 'diff-layout-changed');
    addMarker(viewerOld, id, 'marker-layout-changed', '→');
    addMarker(viewerNew, id, 'marker-layout-changed', '→');
  });

  Object.entries(diffJson._changed || {}).forEach(([id, obj]) => {
    const details = Object.entries(obj.attrs).map(([attr, ch]) =>
      `<tr><td>${attr}</td><td>${ch.oldValue}</td><td>${ch.newValue}</td></tr>`
    ).join('');

    const table = `<table><tr><th>Attribute</th><th>Old</th><th>New</th></tr>${details}</table>`;
    addOverlay(viewerOld, id, `<div id="changeDetailsOld_${id}" class="changeDetails">${table}</div>`);
    addOverlay(viewerNew, id, `<div id="changeDetailsNew_${id}" class="changeDetails">${table}</div>`);

    highlightElement(viewerOld, id, 'diff-changed');
    highlightElement(viewerNew, id, 'diff-changed');
    addMarker(viewerOld, id, 'marker-changed', '✎');
    addMarker(viewerNew, id, 'marker-changed', '✎');
  });
}

const highlightElement = (viewer:NavigatedViewer, id: string, cls: string) => {
  const canvas = viewer.get('canvas') as Canvas;
  canvas.addMarker(id, cls);
}

const unhighlightElement = (viewer:NavigatedViewer, id: string, cls: string) => {
  const canvas = viewer.get('canvas') as Canvas;
  canvas.removeMarker(id, cls);
}

const addMarker = (viewer:NavigatedViewer, id: string, className: string, symbol: string) => {
  const overlays = viewer.get('overlays') as Overlay;
  try {
    overlays.add(id, 'diff', {
      position: { top: -12, right: 12 },
      html: `<span class="marker ${className}">${symbol}</span>`
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