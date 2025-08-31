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