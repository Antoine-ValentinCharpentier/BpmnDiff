import type { ChangedElement } from "bpmn-js-differ";

export function OverlayTable({ diff }: { diff: ChangedElement }) {
  if (!diff || !diff.attrs || Object.keys(diff.attrs).length === 0) {
    return (
      <div>
        <p>Les modifications d'attributs n'ont pas pu être identifiées. Veuillez les consulter dans le modeler.</p>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Old</th>
            <th>New</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(diff.attrs).map(([attr, ch]) => (
            <tr key={attr}>
              <td>{attr}</td>
              <td>{ch.oldValue}</td>
              <td>{ch.newValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
