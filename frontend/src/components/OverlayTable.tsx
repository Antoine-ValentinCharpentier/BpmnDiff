import type { ChangedElement } from "bpmn-js-differ";

type Props = {
    diff: ChangedElement;
    onClick: () => void;
};

export const OverlayTable: React.FC<Props> = ({ diff, onClick }) => {
  if (!diff || !diff.attrs || Object.keys(diff.attrs).length === 0) {
    return (
      <div onClick={onClick}>
        <p>Les modifications d'attributs n'ont pas pu être identifiées. Veuillez les consulter dans le modeler.</p>
      </div>
    );
  }

  return (
    <div onClick={onClick}>
      <table>
        <thead>
          <tr>
            <th>Attribut</th>
            <th>Ancienne valeur</th>
            <th>Nouvelle valeur</th>
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
