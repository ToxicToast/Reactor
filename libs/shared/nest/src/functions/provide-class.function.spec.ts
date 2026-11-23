import { Test } from '@nestjs/testing';
import { provideClass } from './provide-class.function.js';

class Engine {
  readonly name = 'v8';
}

class Car {
  constructor(
    readonly engine: Engine,
    readonly seats: number,
  ) {}
}

class Needs {
  constructor(
    readonly a: unknown,
    readonly b: unknown,
  ) {}
}

class WithDefault {
  constructor(
    readonly a: unknown,
    readonly ttl = 60,
  ) {}
}

const SEATS = Symbol('SEATS');
const VEHICLE = Symbol('VEHICLE');

describe('provideClass', () => {
  it('builds a class from its injected dependencies', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        provideClass(Engine),
        { provide: SEATS, useValue: 4 },
        provideClass(Car, [Engine, SEATS]),
      ],
    }).compile();

    const car = moduleRef.get(Car);

    expect(car.engine).toBeInstanceOf(Engine);
    expect(car.seats).toBe(4);
  });

  it('registers a class under a custom token', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [provideClass(Engine, [], VEHICLE)],
    }).compile();

    expect(moduleRef.get(VEHICLE)).toBeInstanceOf(Engine);
  });

  it('rejects fewer injects than required parameters', () => {
    expect(() => provideClass(Needs, ['A'])).toThrow(
      'Needs expects 2 dependencies but got 1',
    );
  });

  it('allows leaving out parameters with defaults', () => {
    expect(() => provideClass(WithDefault, ['A'])).not.toThrow();
  });
});
