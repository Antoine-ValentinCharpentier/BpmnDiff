export interface DiffFile {
  fileNameBefore: string;
  fileNameAfter: string;
  xmlBefore: string;
  xmlAfter: string;
}

export interface DiffResponse {
  added: DiffFile[];
  updated: DiffFile[];
  deleted: DiffFile[];
}
