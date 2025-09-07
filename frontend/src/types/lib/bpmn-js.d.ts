declare module "bpmn-js" {
  export default class NavigatedViewer {
    constructor(options?: any);

    importXML(xml: string): Promise<any>;
    saveXML(options?: any): Promise<{ xml: string }>;
    get(service: string): any;
    on(event: string, callback: (event: any) => void): void;
    off(event: string, callback: (event: any) => void): void;
    destroy(): void;
    _container?: HTMLElement;
    canvas: Canvas;
    xml: string;
  }
}

type Canvas = {
  viewbox: (viewbox?: { x: number; y: number; width: number; height: number }) => { x: number; y: number; width: number; height: number };
  on: (event: string, callback: (...args: any[]) => void) => void;
  addMarker: (id: string, cls: string) => void;
  removeMarker: (id: string, cls: string) => void;
};

type Overlay = {
  add: (id: string, type: string, html: Object) => void;
};

type BpmnElement = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  waypoints?: { x: number; y: number }[];
};

type ElementRegistry = {
  getAll(): { id: string }[];
};