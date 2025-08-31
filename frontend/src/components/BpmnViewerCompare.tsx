import { useEffect, useRef } from "react";
import { BpmnViewer } from "./BpmnViewer";
import { setupViewer } from "../utils/BpmnDisplayUtils";
import type NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

type Props = {
  xmlBefore: string;
  xmlAfter: string;
  prefix: string;
  isManualMode: boolean;
};

export const BpmnViewerCompare: React.FC<Props> = ({ xmlBefore, xmlAfter, prefix, isManualMode }) => {
  const viewerLeftRef = useRef<HTMLDivElement | null>(null);
  const viewerRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let viewerLeft: NavigatedViewer | undefined;
    let viewerRight: NavigatedViewer | undefined;

    (async () => {
      viewerLeft = await setupViewer(viewerLeftRef, xmlBefore);
      viewerRight = await setupViewer(viewerRightRef, xmlAfter);
    })();

    return () => {
      viewerLeft?.destroy();
      viewerRight?.destroy();
    };
  }, [xmlBefore, xmlAfter]);

  return (
    <div className="bpmn-diff-viewer flex gap-4">
      {xmlBefore && (
        <BpmnViewer
          containerId={`${prefix}-left`}
          title="Previous BPMN"
          isManualMode={isManualMode}
          side="left"
          ref={viewerLeftRef}
        />
      )}
      {xmlAfter && (
        <BpmnViewer
          containerId={`${prefix}-right`}
          title="New BPMN"
          isManualMode={isManualMode}
          side="right"
          ref={viewerRightRef}
        />
      )}
    </div>
  );
};
