import { AstNodeOptions, BasicAppendValue, Nullable, Prettify, SourceBuilder, notNullish } from '@goast/core';

import { TsDecorator, tsDecorator } from './decorator';
import { TsType, TsValue } from './types';
import { TsNode } from '../node';
import { writeTsNode } from '../utils/write-ts-nodes';
import { writeTsParameters } from '../utils/write-ts-parameters';

type Injects = 'decorators' | 'name' | 'type' | 'default';

type Options<TBuilder extends SourceBuilder, TInjects extends string = never> = AstNodeOptions<
  typeof TsNode<TBuilder, TInjects | Injects>,
  {
    name: string;
    description?: Nullable<BasicAppendValue<TBuilder>>;
    decorators?: Nullable<Nullable<TsDecorator<TBuilder>>[]>;
    type?: Nullable<TsType<TBuilder>>;
    optional?: Nullable<boolean>;
    default?: Nullable<TsValue<TBuilder>>;
  }
>;

export class TsParameter<TBuilder extends SourceBuilder, TInjects extends string = never> extends TsNode<
  TBuilder,
  TInjects | Injects
> {
  public name: string;
  public description: BasicAppendValue<TBuilder> | null;
  public decorators: TsDecorator<TBuilder>[];
  public type: TsType<TBuilder> | null;
  public optional: boolean;
  public default: TsValue<TBuilder> | null;

  constructor(options: Options<TBuilder, TInjects>) {
    super(options);
    this.name = options.name;
    this.description = options.description ?? null;
    this.decorators = options.decorators?.filter(notNullish) ?? [];
    this.type = options.type ?? null;
    this.optional = options.optional ?? false;
    this.default = options.default ?? null;
  }

  protected override onWrite(builder: TBuilder): void {
    builder.append(this.inject.beforeDecorators);
    tsDecorator.write(builder, this.decorators);
    builder.append(this.inject.afterDecorators);

    builder.append(this.inject.beforeName, this.name, this.inject.afterName);
    if (this.optional) builder.append('?');

    if (this.type) {
      builder.append(': ');
      builder.append(this.inject.beforeType);
      writeTsNode(builder, this.type);
      builder.append(this.inject.afterType);
    }

    if (this.default) {
      builder.append(' = ');
      builder.append(this.inject.beforeDefault);
      writeTsNode(builder, this.default);
      builder.append(this.inject.afterDefault);
    }
  }
}

const createParameter = <TBuilder extends SourceBuilder>(
  name: Options<TBuilder>['name'],
  options?: Prettify<Omit<Options<TBuilder>, 'name'>>,
) => new TsParameter<TBuilder>({ ...options, name });

export const tsParameter = Object.assign(createParameter, {
  write: writeTsParameters,
});
