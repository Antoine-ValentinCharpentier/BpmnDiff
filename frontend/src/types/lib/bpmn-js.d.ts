declare module "bpmn-js" {
  export default class NavigatedViewer {
    constructor(options?: any);

    importXML(xml: string): Promise<any>;
    saveXML(options?: any): Promise<{ xml: string }>;

    get<T extends "canvas" | "overlays" | "elementRegistry">(service: T): 
      T extends "canvas" ? Canvas :
      T extends "overlays" ? Overlays :
      T extends "elementRegistry" ? ElementRegistry :
      any;

    on(event: string, callback: (event: any) => void): void;
    off(event: string, callback: (event: any) => void): void;
    destroy(): void;
    _container?: HTMLElement;
    canvas: Canvas;
    xml: string;
  }

  type Canvas = {
    viewbox: (viewbox?: { x: number; y: number; width: number; height: number }) => { x: number; y: number; width: number; height: number };
    on: (event: string, callback: (...args: any[]) => void) => void;
    addMarker: (id: string, cls: string) => void;
    removeMarker: (id: string, cls: string) => void;
  };

  type Overlays = {
    add: (id: string, type: string, config: { position: { bottom?: number; left?: number; top?: number; right?: number }, html: string }) => void;
    remove: (filter: { element: string; type: string }) => void;
  };

  type ElementRegistry = {
    get(id: string): BpmnElement | undefined;
    getGraphics(id: string): SVGElement | undefined;
    getAll(): { id: string, type: string }[];
  };

  type BpmnElement = {
    id?: string;
    type?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    waypoints?: { x: number; y: number }[];
  };
}
