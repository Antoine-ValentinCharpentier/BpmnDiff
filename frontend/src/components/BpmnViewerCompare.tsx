import { useEffect, useRef } from "react";
import { BpmnViewer } from "./BpmnViewer";
import { calcDiff, CLASS_ELEMENT_ADDED, CLASS_ELEMENT_DELETED, displayOverlayDiff, highlightAllElements, setupViewer, syncViewersViewbox } from "../utils/BpmnDisplayUtils";
import type NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

import "../assets/styles/global/diff.css";

type Props = {
  xmlBefore: string;
  xmlAfter: string;
  prefix: string;
  isManualMode: boolean;
};

export const BpmnViewerCompare: React.FC<Props> = ({ xmlBefore, xmlAfter, prefix, isManualMode }) => {
  const viewerLeftDivRef = useRef<HTMLDivElement | null>(null);
  const viewerRightDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let viewerLeft: NavigatedViewer | undefined;
    let viewerRight: NavigatedViewer | undefined;

    (async () => {
      viewerLeft = await setupViewer(viewerLeftDivRef, xmlBefore);
      viewerRight = await setupViewer(viewerRightDivRef, xmlAfter);

      if (viewerLeft && viewerRight) {
        syncViewersViewbox(viewerLeft, viewerRight);
        const diffJson = await calcDiff(xmlBefore, xmlAfter);
        displayOverlayDiff(viewerLeft, viewerRight, diffJson);
      } else if (viewerLeft) {
        highlightAllElements(viewerLeft, CLASS_ELEMENT_DELETED);
      } else if (viewerRight) {
        highlightAllElements(viewerRight, CLASS_ELEMENT_ADDED);
      }
    })();

    return () => {
      viewerLeft?.destroy();
      viewerRight?.destroy();
    };
  }, [xmlBefore, xmlAfter]);

  return (
    <div className="bpmn-diff">
      {xmlBefore && (
        <BpmnViewer
          containerId={`${prefix}-left`}
          title="Ancienne version"
          isManualMode={isManualMode}
          side="left"
          ref={viewerLeftDivRef}
        />
      )}
      {xmlAfter && (
        <BpmnViewer
          containerId={`${prefix}-right`}
          title="Nouvelle version"
          isManualMode={isManualMode}
          side="right"
          ref={viewerRightDivRef}
        />
      )}
    </div>
  );
};