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
      className={`di-container ${side}${isManualMode ? " drop-zone" : ""}`}
      id={containerId}
    >
      <div className="io-control di-header">
        <h2>{title}</h2>
        {isManualMode && <input className="file" type="file" />}
      </div>

      <div className="canvas" ref={ref} />
    </div>
  )
);
