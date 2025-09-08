import { useEffect, useRef, useState } from "react";
import { BpmnViewer } from "./BpmnViewer";
import { addOverlay, calcDiff, CLASS_ELEMENT_ADDED, CLASS_ELEMENT_DELETED, displayOverlayDiff, highlightAllElements, removeOverlay, setupViewer, syncViewersViewbox } from "../utils/BpmnDisplayUtils";
import type NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

type Props = {
  xmlBefore: string;
  xmlAfter: string;
  prefix: string;
  isManualMode: boolean;
};

export const BpmnViewerCompare: React.FC<Props> = ({ xmlBefore, xmlAfter, prefix, isManualMode }) => {
  const viewerLeftDivRef = useRef<HTMLDivElement | null>(null);
  const viewerRightDivRef = useRef<HTMLDivElement | null>(null);

  const viewerLeftRef = useRef<NavigatedViewer | undefined>(undefined);
  const viewerRighRef = useRef<NavigatedViewer | undefined>(undefined);

  const [_, setOpenOverlays] = useState<Set<string>>(new Set());

  useEffect(() => {
    let viewerLeft: NavigatedViewer | undefined;
    let viewerRight: NavigatedViewer | undefined;

    (async () => {
      viewerLeft = await setupViewer(viewerLeftDivRef, xmlBefore);
      viewerRight = await setupViewer(viewerRightDivRef, xmlAfter);

      viewerLeftRef.current = viewerLeft;
      viewerRighRef.current = viewerRight;

      if (viewerLeft && viewerRight) {
        syncViewersViewbox(viewerLeft, viewerRight);
        const diffJson = await calcDiff(xmlBefore, xmlAfter);
        displayOverlayDiff(viewerLeft, viewerRight, diffJson, toggleOverlayUpdatedElements);
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


  const toggleOverlayUpdatedElements = (id: string) => {
    const left = viewerLeftRef.current;
    const right = viewerRighRef.current;

    if(!left || !right) return;

    setOpenOverlays(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        removeOverlay(left, id);
        removeOverlay(right, id);
        next.delete(id);
      } else {
        addOverlay(left, id, "<p>test</p>");
        addOverlay(right, id, "<p>test</p>");
        console.log("added");
        next.add(id);
      }
      return next;
    });
  };


  return (
    <div className="bpmn-diff-viewer flex gap-4">
      {xmlBefore && (
        <BpmnViewer
          containerId={`${prefix}-left`}
          title="Previous BPMN"
          isManualMode={isManualMode}
          side="left"
          ref={viewerLeftDivRef}
        />
      )}
      {xmlAfter && (
        <BpmnViewer
          containerId={`${prefix}-right`}
          title="New BPMN"
          isManualMode={isManualMode}
          side="right"
          ref={viewerRightDivRef}
        />
      )}
    </div>
  );
};