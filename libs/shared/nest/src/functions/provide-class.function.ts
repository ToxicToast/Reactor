import type { FactoryProvider, InjectionToken } from '@nestjs/common';

export const provideClass = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: new (...args: Array<any>) => T,
  inject: Array<InjectionToken> = [],
  provide: InjectionToken = type,
): FactoryProvider<T> => {
  // `length` zählt nur die Parameter ohne Default; weniger Injects sind immer ein Fehler
  if (inject.length < type.length) {
    throw new Error(
      `${type.name} expects ${type.length} dependencies but got ${inject.length}`,
    );
  }
  return {
    provide,
    inject,
    useFactory: (...deps: Array<unknown>) => new type(...deps),
  };
};
