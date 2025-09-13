export type ChangeType = "ADDED" | "DELETED" | "UPDATED";

export interface DiffFile {
  fileNameBefore: string;
  fileNameAfter: string;
  xmlBefore: string;
  xmlAfter: string;
  changeType: ChangeType;
}

export type DiffResponse =  DiffFile[];