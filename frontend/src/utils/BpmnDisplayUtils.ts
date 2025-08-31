import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

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

