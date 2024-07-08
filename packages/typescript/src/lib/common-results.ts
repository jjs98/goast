export type TypeScriptComponentOutput = {
  component: string;
  filePath?: string;
  imports: TypeScriptImport[];
  additionalExports?: string[];
};

export type TypeScriptExportOutput = {
  component: string;
  filePath: string;
};

export type TypeScriptImportKind = 'module' | 'file';

export type TypeScriptImport = {
  kind: TypeScriptImportKind;
  modulePath: string;
  name: string;
};
