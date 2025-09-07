declare module "bpmn-js-differ" {
  type ChangedAttr = {
    oldValue: string | number | null;
    newValue: string | number | null;
  };

  type ChangedElement = {
    attrs: Record<string, ChangedAttr>;
  };

  type DiffResult = {
    _removed?: Record<string, unknown>;
    _added?: Record<string, unknown>;
    _layoutChanged?: Record<string, unknown>;
    _changed?: Record<string, ChangedElement>;
  };


  export function diff(before: any, after: any): DiffResult;
}
