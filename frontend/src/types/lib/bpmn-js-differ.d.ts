declare module "bpmn-js-differ" {
  export interface DiffResult {
    _added?: Record<string, any>;
    _removed?: Record<string, any>;
    _changed?: Record<string, any>;
    _layoutChanged?: Record<string, any>;
  }

  export function diff(before: any, after: any): DiffResult;
}
