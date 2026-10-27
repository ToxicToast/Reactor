import type { InjectionToken, ModuleMetadata } from '@nestjs/common';
import type { Optional } from '@toxictoast/shared-types';
import type { ReadinessProbe } from './readiness-probe.interface.js';

export interface ReadinessProbesProvider {
  readonly imports?: Optional<NonNullable<ModuleMetadata['imports']>>;
  readonly inject: Array<InjectionToken>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly useFactory: (...deps: Array<any>) => ReadonlyArray<ReadinessProbe>;
}
