import BpmnJS from 'bpmn-js/dist/bpmn-navigated-viewer.development.js'
import { diff as diffBpmnXml } from 'bpmn-js-differ';
import BpmnModdle from 'bpmn-moddle';

async function loadModel(diagramXML) {
  const bpmnModdle = new BpmnModdle();
  const { rootElement: definitionsA } = await bpmnModdle.fromXML(diagramXML);
  return definitionsA;
}

export class BpmnViewerWrapper {
  constructor(side) {
    this.side = side;
    this.viewer = new BpmnJS({
      container: `#canvas-${side}`,
      height: '100%',
      width: '100%'
    });
    this.xml;
  }

  async load(xml) {
    await this.viewer.importXML(xml);
    this.xml = xml;
  }

  highlightElement(id, cls) {
    this.viewer.get('canvas').addMarker(id, cls);
  }

  unhighlightElement(id, cls) {
    this.viewer.get('canvas').removeMarker(id, cls);
  }

  addMarker(id, className, symbol) {
    const overlays = this.viewer.get('overlays');
    try {
      overlays.add(id, 'diff', {
        position: { top: -12, right: 12 },
        html: `<span class="marker ${className}">${symbol}</span>`
      });
    } catch (e) {}
  }

  addOverlay(id, html) {
    this.viewer.get('overlays').add(id, 'diff', {
      position: { bottom: -5, left: 0 },
      html
    });
  }

  centerElement(element) {
    const canvas = this.viewer.get('canvas');
    const container = document.querySelector('.di-container');
    const { width, height } = container.getBoundingClientRect();
    const { x, y } = element.waypoints?.[0] || {
      x: element.x + element.width / 2,
      y: element.y + element.height / 2
    };
    canvas.viewbox({
      x: x - width / 2,
      y: y - height / 2 + 100,
      width,
      height
    });
  }

  onViewboxChange(callback) {
    this.viewer.on('canvas.viewbox.changed', callback);
  }

  setViewbox(viewbox) {
    this.viewer.get('canvas').viewbox(viewbox);
  }
}

export default class BpmnViewerManager {
  constructor(leftId, rightId) {
    this.leftSideName = leftId;
    this.rightSideName = rightId;
    this.viewers = {
      [leftId]: new BpmnViewerWrapper(leftId),
      [rightId]: new BpmnViewerWrapper(rightId)
    };
    this.syncViewersViewbox(leftId, rightId);
  }

  getViewer(side) {
    return this.viewers[side];
  }

  async loadDiagram(side, xml) {
    await this.getViewer(side).load(xml);
    this.showDiff();
  }

  syncViewersViewbox(left, right) {
    let changing = false;

    const sync = (toViewer) => (e) => {
      if (changing) return;
      changing = true;
      toViewer.setViewbox(e.viewbox);
      changing = false;
    };

    this.getViewer(left).onViewboxChange(sync(this.getViewer(right)));
    this.getViewer(right).onViewboxChange(sync(this.getViewer(left)));
  }

  async showDiff() {
    const viewerOld = this.getViewer(this.leftSideName);
    const viewerNew = this.getViewer(this.rightSideName);

    const bpmnBefore = await loadModel(viewerOld.xml);
    const bpmnAfter = await loadModel(viewerNew.xml);

    const diffJson = diffBpmnXml(bpmnBefore, bpmnAfter);

    console.log(viewerOld, viewerNew);
    console.log(diffJson);

    this.displayOverlayDiff(viewerOld, viewerNew, diffJson)
    this.displayDetailsTableChanges(viewerOld, viewerNew, diffJson)
  }

  displayOverlayDiff(viewerOld, viewerNew, diffJson) {
    Object.entries(diffJson._removed || {}).forEach(([id, obj]) => {
      viewerOld.highlightElement(id, 'diff-removed');
      viewerOld.addMarker(id, 'marker-removed', '−');
    });

    Object.entries(diffJson._added || {}).forEach(([id, obj]) => {
      viewerNew.highlightElement(id, 'diff-added');
      viewerNew.addMarker(id, 'marker-added', '+');
    });

    Object.entries(diffJson._layoutChanged || {}).forEach(([id]) => {
      viewerOld.highlightElement(id, 'diff-layout-changed');
      viewerNew.highlightElement(id, 'diff-layout-changed');
      viewerOld.addMarker(id, 'marker-layout-changed', '→');
      viewerNew.addMarker(id, 'marker-layout-changed', '→');
    });

    Object.entries(diffJson._changed || {}).forEach(([id, obj]) => {
      const details = Object.entries(obj.attrs).map(([attr, ch]) =>
        `<tr><td>${attr}</td><td>${ch.oldValue}</td><td>${ch.newValue}</td></tr>`
      ).join('');

      const table = `<table><tr><th>Attribute</th><th>Old</th><th>New</th></tr>${details}</table>`;
      viewerOld.addOverlay(id, `<div id="changeDetailsOld_${id}" class="changeDetails">${table}</div>`);
      viewerNew.addOverlay(id, `<div id="changeDetailsNew_${id}" class="changeDetails">${table}</div>`);

      viewerOld.highlightElement(id, 'diff-changed');
      viewerNew.highlightElement(id, 'diff-changed');
      viewerOld.addMarker(id, 'marker-changed', '✎');
      viewerNew.addMarker(id, 'marker-changed', '✎');
    });
  }

  displayDetailsTableChanges(viewerOld, viewerNew, diffJson) {
    const container = document.querySelector('#changes-overview .changes');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>#</th><th>Name</th><th>Type</th><th>Change</th></tr></thead>';
    container.appendChild(table);

    let count = 0;

    const addRow = (element, type, label) => {
      const row = document.createElement('tr');
      row.classList.add('entry', type);
      row.dataset.element = element.id;
      row.dataset.changed = type;

      row.innerHTML = `<td>${count++}</td><td>${element.name || ''}</td><td>${element.$type.replace('bpmn:', '')}</td><td><span class="status">${label}</span></td>`;

      row.addEventListener('mouseenter', () => {
        const viewer = type === 'removed' ? viewerOld : viewerNew;
        viewer.highlightElement(element.id, 'highlight');
      });

      row.addEventListener('mouseleave', () => {
        const viewer = type === 'removed' ? viewerOld : viewerNew;
        viewer.unhighlightElement(element.id, 'highlight');
      });

      row.addEventListener('click', () => {
        const viewer = type === 'removed' ? viewerOld : viewerNew;
        const element = viewer.get('elementRegistry')._elements[element.id]?.element;
        if (element) viewer.centerElement(element);
      });

      table.appendChild(row);
    };

    Object.values(diffJson._removed || {}).forEach(el => addRow(el, 'removed', 'Removed'));
    Object.values(diffJson._added || {}).forEach(el => addRow(el, 'added', 'Added'));
    Object.values(diffJson._changed || {}).forEach(change => addRow(change.model, 'changed', 'Changed'));
    Object.values(diffJson._layoutChanged || {}).forEach(el => addRow(el, 'layout-changed', 'Layout Changed'));
  }
}