import type { AstNodeOptions, Nullable, Prettify, SourceBuilder } from '@goast/core';

import type { TypeScriptExportType } from '../../common-results.ts';
import { TypeScriptFileBuilder } from '../../file-builder.ts';
import { TsNode } from '../node.ts';
import { writeTsNodes } from '../utils/write-ts-nodes.ts';

type Injects = never;

type Options<TBuilder extends SourceBuilder, TInjects extends string = never> = AstNodeOptions<
  typeof TsNode<TBuilder, TInjects | Injects>,
  {
    name: string;
    filePath: string;
    kind?: Nullable<TypeScriptExportType>;
  }
>;

export class TsExport<TBuilder extends SourceBuilder, TInjects extends string = never> extends TsNode<
  TBuilder,
  TInjects | Injects
> {
  public name: string;
  public filePath: string;
  public kind: TypeScriptExportType;

  constructor(options: Options<TBuilder, TInjects>) {
    super(options);
    this.name = options.name;
    this.filePath = options.filePath;
    this.kind = options.kind ?? 'export';
  }

  protected override onWrite(builder: TBuilder): void {
    if (builder instanceof TypeScriptFileBuilder) {
      builder.addExport(this.name, this.filePath, { type: this.kind });
    } else {
      builder.appendLine(
        this.kind === 'type-export' ? 'export type' : 'export',
        ` { ${this.name} } from '${this.filePath}';`,
      );
    }
  }
}

export const createExport = <TBuilder extends SourceBuilder>(
  name: Options<TBuilder>['name'],
  filePath: Options<TBuilder>['filePath'],
  options?: Prettify<Omit<Options<TBuilder>, 'name' | 'filePath'>>,
): TsExport<TBuilder> => new TsExport<TBuilder>({ ...options, name, filePath });

export const tsExport: typeof createExport & { write: typeof writeTsNodes } = Object.assign(createExport, {
  write: writeTsNodes,
});
