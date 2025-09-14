import { forwardRef } from "react";

type Props = {
  containerId: string;
  title: string;
  isManualMode: boolean;
  side: string;
};

export const BpmnViewer = forwardRef<HTMLDivElement, Props>(
  ({ containerId, title, isManualMode, side }, ref) => (
    <div
      className={`viewer ${side}${isManualMode ? " drop-zone" : ""}`}
      id={containerId}
    >
      <div className="viewer-header">
        <h2>{title}</h2>
        {isManualMode && <input className="file" type="file" />}
      </div>

      <div className="canvas" ref={ref} />
    </div>
  )
);
