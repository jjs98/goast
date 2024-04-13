import type { TsArrayType } from './array-type';
import type { TsArrowFunction } from './arrow-function';
import type { TsClass } from './class';
import type { TsFunction } from './function';
import type { TsFunctionType } from './function-type';
import type { TsIntersectionType } from './intersection-type';
import type { TsLookupType } from './lookup-type';
import type { TsObject } from './object';
import type { TsObjectType } from './object-type';
import type { TsReference } from './reference';
import type { TsString } from './string';
import type { TsTuple } from './tuple';
import type { TsUnionType } from './union-type';
import type { BasicAppendValue, SourceBuilder } from '@goast/core';

export type TsType<TBuilder extends SourceBuilder> =
  | BasicAppendValue<TBuilder>
  | TsIntersectionType<TBuilder>
  | TsUnionType<TBuilder>
  | TsArrayType<TBuilder>
  | TsFunctionType<TBuilder>
  | TsObjectType<TBuilder>
  | TsString<TBuilder>
  | TsLookupType<TBuilder>
  | TsReference<TBuilder>;

export type TsValue<TBuilder extends SourceBuilder> =
  | BasicAppendValue<TBuilder>
  | TsObject<TBuilder>
  | TsTuple<TBuilder>
  | TsString<TBuilder>
  | TsArrowFunction<TBuilder>
  | TsFunction<TBuilder>
  | TsClass<TBuilder>
  | TsReference<TBuilder>;