const viewers = createViewers('left', 'right');

function createViewer(side) {
  return new BpmnJS({
    container: `#canvas-${side}`,
    height: '100%',
    width: '100%'
  });
}

function syncViewers(a, b) {
  let changing;

  const update = (viewer) => (e) => {
    if (changing) return;
    changing = true;
    viewer.get('canvas').viewbox(e.viewbox);
    changing = false;
  };

  a.on('canvas.viewbox.changed', update(b));
  b.on('canvas.viewbox.changed', update(a));
}

function createViewers(left, right) {
  const sides = {
    [left]: createViewer(left),
    [right]: createViewer(right)
  };

  syncViewers(sides[left], sides[right]);
  return sides;
}

function getViewer(side) {
  return viewers[side];
}

export async function loadDiagram(side, xml) {
  const viewer = getViewer(side);
  await viewer.importXML(xml);
}

function addMarker(viewer, elementId, className, symbol) {
  const overlays = viewer.get('overlays');
  try {
    overlays.add(elementId, 'diff', {
      position: { top: -12, right: 12 },
      html: `<span class="marker ${className}">${symbol}</span>`
    });
  } catch (e) {}
}

function highlight(viewer, id, cls) {
  viewer.get('canvas').addMarker(id, cls);
}

function unhighlight(viewer, id, cls) {
  viewer.get('canvas').removeMarker(id, cls);
}

export function showDiff(viewerOldName, viewerNewName, diffJson) {
  const viewerOld = getViewer(viewerOldName)
  const viewerNew = getViewer(viewerNewName)

  for (const [id, obj] of Object.entries(diffJson._removed)) {
    highlight(viewerOld, id, 'diff-removed');
    addMarker(viewerOld, id, 'marker-removed', '−');
  }

  for (const [id, obj] of Object.entries(diffJson._added)) {
    highlight(viewerNew, id, 'diff-added');
    addMarker(viewerNew, id, 'marker-added', '+');
  }

  for (const [id, obj] of Object.entries(diffJson._layoutChanged)) {
    highlight(viewerOld, id, 'diff-layout-changed');
    highlight(viewerNew, id, 'diff-layout-changed');
    addMarker(viewerOld, id, 'marker-layout-changed', '→');
    addMarker(viewerNew, id, 'marker-layout-changed', '→');
  }

  for (const [id, obj] of Object.entries(diffJson._changed)) {
    const details = Object.entries(obj.attrs).map(([attr, ch]) =>
      `<tr><td>${attr}</td><td>${ch.oldValue}</td><td>${ch.newValue}</td></tr>`
    ).join('');

    const table = `<table><tr><th>Attribute</th><th>Old</th><th>New</th></tr>${details}</table>`;

    const detailsOld = `<div id="changeDetailsOld_${id}" class="changeDetails">${table}</div>`;
    const detailsNew = `<div id="changeDetailsNew_${id}" class="changeDetails">${table}</div>`;

    viewerOld.get('overlays').add(id, 'diff', { position: { bottom: -5, left: 0 }, html: detailsOld });
    viewerNew.get('overlays').add(id, 'diff', { position: { bottom: -5, left: 0 }, html: detailsNew });

    highlight(viewerOld, id, 'diff-changed');
    highlight(viewerNew, id, 'diff-changed');
    addMarker(viewerOld, id, 'marker-changed', '✎');
    addMarker(viewerNew, id, 'marker-changed', '✎');
  }

  showChangesOverview(diffJson, viewerOld, viewerNew);
}

function showChangesOverview(result, viewerOld, viewerNew) {
  const container = document.querySelector('#changes-overview .changes');
  container.innerHTML = '';

  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>#</th><th>Name</th><th>Type</th><th>Change</th></tr></thead>';

  let count = 0;

  const addRow = (element, type, label) => {
    const row = document.createElement('tr');
    row.classList.add('entry', type);
    row.dataset.element = element.id;
    row.dataset.changed = type;
    row.innerHTML = `<td>${count++}</td><td>${element.name || ''}</td><td>${element.$type.replace('bpmn:', '')}</td><td><span class="status">${label}</span></td>`;

    row.addEventListener('mouseenter', () => {
      const viewer = (type === 'removed') ? viewerOld : viewerNew;
      highlight(viewer, element.id, 'highlight');
    });

    row.addEventListener('mouseleave', () => {
      const viewer = (type === 'removed') ? viewerOld : viewerNew;
      unhighlight(viewer, element.id, 'highlight');
    });

    row.addEventListener('click', () => {
      const viewer = (type === 'removed') ? viewerOld : viewerNew;
      const elementData = viewer.get('elementRegistry')._elements[element.id].element;
      const container = document.querySelector('.di-container');
      const { width, height } = container.getBoundingClientRect();
      const { x, y } = elementData.waypoints ? elementData.waypoints[0] : {
        x: elementData.x + elementData.width / 2,
        y: elementData.y + elementData.height / 2
      };
      viewer.get('canvas').viewbox({
        x: x - (width / 2),
        y: y - ((height / 2) - 100),
        width,
        height
      });
    });

    table.appendChild(row);
  };

  Object.values(result._removed).forEach(el => addRow(el, 'removed', 'Removed'));
  Object.values(result._added).forEach(el => addRow(el, 'added', 'Added'));
  Object.values(result._changed).forEach(change => addRow(change.model, 'changed', 'Changed'));
  Object.values(result._layoutChanged).forEach(el => addRow(el, 'layout-changed', 'Layout Changed'));

  container.appendChild(table);
}

// UI setup

document.querySelector('#changes-overview .show-hide-toggle').addEventListener('click', () => {
  document.querySelector('#changes-overview').classList.toggle('collapsed');
});
