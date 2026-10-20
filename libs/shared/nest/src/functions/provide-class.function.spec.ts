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
});
