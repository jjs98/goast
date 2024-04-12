import {
  AppendValue,
  AstNodeOptions,
  BasicAppendValue,
  Nullable,
  Prettify,
  SourceBuilder,
  createOverwriteProxy,
  notNullish,
} from '@goast/core';

import { ktAnnotation, KtAnnotation } from './annotation';
import { ktArgument } from './argument';
import { KtConstructor } from './constructor';
import { ktDoc, KtDoc } from './doc';
import { KtEnum } from './enum';
import { KtFunction } from './function';
import { ktGenericParameter, KtGenericParameter } from './generic-parameter';
import { ktInitBlock, KtInitBlock } from './init-block';
import { KtInterface } from './interface';
import { KtObject } from './object';
import { KtProperty } from './property';
import { KtType } from './types';
import { KtAccessModifier } from '../common';
import { KtNode } from '../node';
import { writeKtMembers } from '../utils/write-kt-members';
import { writeKtNode, writeKtNodes } from '../utils/write-kt-node';

type Injects =
  | 'doc'
  | 'annotations'
  | 'modifiers'
  | 'name'
  | 'generics'
  | 'primaryConstructor'
  | 'inheritList'
  | 'body'
  | 'members';

type Options<TBuilder extends SourceBuilder, TInjects extends string = never> = AstNodeOptions<
  typeof KtNode<TBuilder, TInjects | Injects>,
  {
    doc?: Nullable<KtDoc<TBuilder>>;
    annotations?: Nullable<Nullable<KtAnnotation<TBuilder>>[]>;
    accessModifier?: Nullable<KtAccessModifier>;
    open?: Nullable<boolean>;
    abstract?: Nullable<boolean>;
    classKind?: Nullable<KtClassKind>;
    name: string;
    generics?: Nullable<Nullable<KtGenericParameter<TBuilder> | BasicAppendValue<TBuilder>>[]>;
    primaryConstructor?: Nullable<KtConstructor<TBuilder>>;
    extends?: Nullable<KtType<TBuilder>>;
    implements?: Nullable<Nullable<KtType<TBuilder>>[]>;
    companionObject?: Nullable<KtObject<TBuilder>>;
    members?: Nullable<Nullable<KtClassMember<TBuilder>>[]>;
  }
>;

export type KtClassKind = 'data' | 'value' | 'annotation' | 'sealed';
export type KtClassMember<TBuilder extends SourceBuilder> =
  | KtConstructor<TBuilder>
  | KtEnum<TBuilder>
  | KtInitBlock<TBuilder>
  | KtInterface<TBuilder>
  | KtProperty<TBuilder>
  | KtFunction<TBuilder>
  | KtClass<TBuilder>
  | AppendValue<TBuilder>;

export class KtClass<TBuilder extends SourceBuilder, TInjects extends string = never> extends KtNode<
  TBuilder,
  TInjects | Injects
> {
  public doc: KtDoc<TBuilder> | null;
  public annotations: KtAnnotation<TBuilder>[];
  public accessModifier: KtAccessModifier | null;
  public open: boolean;
  public abstract: boolean;
  public classKind: KtClassKind | null;
  public name: string;
  public generics: (KtGenericParameter<TBuilder> | BasicAppendValue<TBuilder>)[];
  public primaryConstructor: KtConstructor<TBuilder> | null;
  public extends: KtType<TBuilder> | null;
  public implements: KtType<TBuilder>[];
  public members: KtClassMember<TBuilder>[];
  public companionObject: Nullable<KtObject<TBuilder>>;

  constructor(options: Options<TBuilder, TInjects>) {
    super(options);
    this.doc = options.doc ?? null;
    this.annotations = options.annotations?.filter(notNullish) ?? [];
    this.accessModifier = options.accessModifier ?? null;
    this.open = options.open ?? false;
    this.abstract = options.abstract ?? false;
    this.classKind = options.classKind ?? null;
    this.name = options.name;
    this.generics = options.generics?.filter(notNullish) ?? [];
    this.primaryConstructor = options.primaryConstructor ?? null;
    this.extends = options.extends ?? null;
    this.implements = options.implements?.filter(notNullish) ?? [];
    this.members = options.members?.filter(notNullish) ?? [];
    this.companionObject = options.companionObject;
  }

  protected override onWrite(builder: TBuilder): void {
    builder.append(this.inject.beforeDoc);
    ktDoc.get(this.doc, { generics: this.generics, parameters: this.primaryConstructor?.parameters })?.write(builder);
    builder.append(this.inject.afterDoc);

    builder.append(this.inject.beforeAnnotations);
    ktAnnotation.write(builder, this.annotations, { multiline: true });
    builder.append(this.inject.afterAnnotations);

    builder.append(this.inject.beforeModifiers);
    if (this.accessModifier) builder.append(this.accessModifier, ' ');
    if (this.open) builder.append('open ');
    if (this.abstract) builder.append('abstract ');
    if (this.classKind) builder.append(this.classKind, ' ');
    builder.append(this.inject.afterModifiers);

    builder.append('class ');
    builder.append(this.inject.beforeName, this.name, this.inject.afterName);

    builder.append(this.inject.beforeGenerics);
    ktGenericParameter.write(builder, this.generics);
    builder.append(this.inject.afterGenerics);

    if (this.primaryConstructor) {
      builder.append(this.inject.beforePrimaryConstructor);
      this.primaryConstructor.writeAsPrimary(builder);
      builder.append(this.inject.afterPrimaryConstructor);
    }

    if (this.extends || this.implements.length > 0) {
      builder.append(' : ');
      builder.append(this.inject.beforeInheritList);
      writeKtNode(builder, this.extends);
      if (this.extends && this.primaryConstructor?.delegateTarget === 'super') {
        ktArgument.write(builder, this.primaryConstructor.delegateArguments);
      }
      if (this.extends && this.implements.length > 0) {
        builder.append(', ');
      }
      writeKtNodes(builder, this.implements, { separator: ', ' });
      builder.append(this.inject.afterInheritList);
    }

    if (this.members.length > 0 || this.primaryConstructor?.body || this.companionObject) {
      builder.append(' ');
      builder.append(this.inject.beforeBody);
      builder.parenthesize(
        '{}',
        (b) => {
          b.append(this.inject.beforeMembers);
          writeKtMembers(b, [
            this.companionObject ? createOverwriteProxy(this.companionObject, { companion: true }) : null,
            this.primaryConstructor?.body ? ktInitBlock(this.primaryConstructor?.body) : null,
            ...this.members,
          ]);
          b.append(this.inject.afterMembers);
        },
        { multiline: true },
      );
      builder.append(this.inject.afterBody);
    }

    builder.appendLine();
  }
}

const createClass = <TBuilder extends SourceBuilder>(
  name: Options<TBuilder>['name'],
  options?: Prettify<Omit<Options<TBuilder>, 'name'>>,
) => new KtClass<TBuilder>({ ...options, name });

export const ktClass = Object.assign(createClass, {
  write: writeKtNodes,
});
