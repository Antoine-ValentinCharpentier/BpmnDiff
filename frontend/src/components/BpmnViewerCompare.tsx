import { useEffect, useRef } from "react";
import { BpmnViewer } from "./BpmnViewer";
import { calcDiff, CLASS_ELEMENT_ADDED, CLASS_ELEMENT_DELETED, displayOverlayDiff, highlightAllElements, setupViewer, syncViewersViewbox } from "../utils/BpmnDisplayUtils";
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

      if(viewerLeft && viewerRight) {
        syncViewersViewbox(viewerLeft, viewerRight)
        const diffJson = await calcDiff(xmlBefore, xmlAfter);
        console.log(diffJson);
        displayOverlayDiff(viewerLeft, viewerRight, diffJson, prefix);
      } else if(viewerLeft) {
          highlightAllElements(viewerLeft, CLASS_ELEMENT_DELETED);
      } else if(viewerRight) {
          highlightAllElements(viewerRight, CLASS_ELEMENT_ADDED);
      }

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