declare module "bpmn-js" {
  export default class BpmnJS {
    constructor(options?: any);

    importXML(xml: string): Promise<any>;
    saveXML(options?: any): Promise<{ xml: string }>;
    get(service: string): any;
    on(event: string, callback: (event: any) => void): void;
    off(event: string, callback: (event: any) => void): void;
    destroy(): void;
    _container?: HTMLElement;
    canvas: Canvas;
  }
}

type Canvas = {
  viewbox: (viewbox?: { x: number; y: number; width: number; height: number }) => { x: number; y: number; width: number; height: number };
  on: (event: string, callback: (...args: any[]) => void) => void;
};