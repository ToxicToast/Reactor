import type { FactoryProvider, InjectionToken } from '@nestjs/common';

export const provideClass = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: new (...args: Array<any>) => T,
  inject: Array<InjectionToken> = [],
  provide: InjectionToken = type,
): FactoryProvider<T> => {
  return {
    provide,
    inject,
    useFactory: (...deps: Array<unknown>) => new type(...deps),
  };
};
