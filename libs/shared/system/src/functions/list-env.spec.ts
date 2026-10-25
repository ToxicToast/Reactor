import { listEnv } from './list-env.function.js';
import { redisConnectionFromEnv } from './redis-connection-from-env.function.js';

describe('listEnv', () => {
  it('splits and trims comma separated values', () => {
    expect(
      listEnv('LIST', [], { LIST: ' 127.0.0.1, ::1 ,,10.0.0.0/8 ' }),
    ).toEqual(['127.0.0.1', '::1', '10.0.0.0/8']);
  });

  it('falls back when the variable is missing or empty', () => {
    expect(listEnv('LIST', ['a'], {})).toEqual(['a']);
    expect(listEnv('LIST', ['a'], { LIST: '  ' })).toEqual(['a']);
  });
});

describe('redisConnectionFromEnv', () => {
  it('connects to a local redis by default', () => {
    expect(redisConnectionFromEnv({})).toEqual({
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
    });
  });
});
