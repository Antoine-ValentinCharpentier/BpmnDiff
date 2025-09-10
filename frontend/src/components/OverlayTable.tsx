import type { ChangedElement } from "bpmn-js-differ";

export function OverlayTable({ diff }: { diff: ChangedElement }) {
  return (
    <div>
      <p>before</p>
      {JSON.stringify(diff)}
      <p>after</p>
    </div>
  );
}
