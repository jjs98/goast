import type { StringBuilder } from '../utils/string-builder/string-builder.ts';
import type { AppendValue } from '../utils/string-builder/utils.ts';
import type { Prettify } from '../utils/type.utils.ts';

const NODE_HISTORY_SYMBOL = Symbol('node-history');
type BuilderWithHistory<T extends StringBuilder = StringBuilder> = T & { [NODE_HISTORY_SYMBOL]?: AstNode[] };

export type AstNodeInject<TBuilder extends StringBuilder, TInjects extends string> = {
  [K in `${'after' | 'before'}${Capitalize<TInjects>}`]?: AppendValue<TBuilder>;
};

export type AstNodeOptions<
  // deno-lint-ignore no-explicit-any
  TBase extends abstract new (...args: any) => any,
  // deno-lint-ignore ban-types
  TExtensions extends object = {},
> = Prettify<TExtensions & ConstructorParameters<TBase>[0]>;

export abstract class AstNode<TBuilder extends StringBuilder = StringBuilder, TInjects extends string = never> {
  public inject: AstNodeInject<TBuilder, TInjects | ''>;

  constructor(options: { inject?: AstNode<TBuilder, TInjects>['inject'] }) {
    this.inject = options.inject ?? {};
  }

  public write(builder: TBuilder): void {
    let history = (builder as BuilderWithHistory)[NODE_HISTORY_SYMBOL];
    if (!history) {
      history = [];
      (builder as BuilderWithHistory)[NODE_HISTORY_SYMBOL] = history;
    }

    history.push(this);
    builder.append(this.inject.before);
    this.onWrite(builder);
    builder.append(this.inject.after);
    history.pop();
  }

  protected getParentNode(builder: TBuilder): AstNode | undefined {
    const history = (builder as BuilderWithHistory)[NODE_HISTORY_SYMBOL];
    return history?.at(-2);
  }

  protected abstract onWrite(builder: TBuilder): void;
}
