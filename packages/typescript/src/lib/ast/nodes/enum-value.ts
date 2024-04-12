import {
  SourceBuilder,
  AstNodeOptions,
  Nullable,
  AppendValue,
  SingleOrMultiple,
  Prettify,
  BasicAppendValue,
} from '@goast/core';

import { TsDoc } from './doc';
import { TsString } from './string';
import { TsNode } from '../node';
import { writeTsNode, writeTsNodes } from '../utils/write-ts-nodes';

type Injects = 'doc' | 'name' | 'value';

type Options<TBuilder extends SourceBuilder, TInjects extends string = never> = AstNodeOptions<
  typeof TsNode<TBuilder, TInjects | Injects>,
  {
    doc?: Nullable<TsDoc<TBuilder>>;
    name: string;
    value?: Nullable<TsString<TBuilder> | BasicAppendValue<TBuilder>>;
  }
>;

export class TsEnumValue<TBuilder extends SourceBuilder, TInjects extends string = never> extends TsNode<
  TBuilder,
  TInjects | Injects
> {
  public doc: TsDoc<TBuilder> | null;
  public name: string;
  public value: TsString<TBuilder> | BasicAppendValue<TBuilder> | null;

  constructor(options: Options<TBuilder, TInjects>) {
    super(options);
    this.name = options.name;
    this.doc = options.doc ?? null;
    this.value = options.value ?? null;
  }

  protected override onWrite(builder: TBuilder): void {
    builder.append(this.inject.beforeDoc);
    this.doc?.write(builder);
    builder.append(this.inject.afterDoc);

    builder.append(this.inject.beforeName, this.name, this.inject.afterName);

    if (this.value) {
      builder.append(' = ');
      builder.append(this.inject.beforeValue);
      writeTsNode(builder, this.value);
      builder.append(this.inject.afterValue);
    }
  }
}

const createEnumValue = <TBuilder extends SourceBuilder>(
  name: Options<TBuilder>['name'],
  options?: Prettify<Omit<Options<TBuilder>, 'name'>>,
) => new TsEnumValue<TBuilder>({ ...options, name });

const writeEnumValues = <TBuilder extends SourceBuilder>(
  builder: TBuilder,
  nodes: SingleOrMultiple<Nullable<TsEnumValue<TBuilder> | AppendValue<TBuilder>>>,
) => {
  writeTsNodes(builder, nodes, { separator: ',\n' });
};

export const tsEnumValue = Object.assign(createEnumValue, {
  write: writeEnumValues,
});
