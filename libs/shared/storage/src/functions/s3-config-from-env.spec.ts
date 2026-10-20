import { s3ConfigFromEnv } from './s3-config-from-env.function.js';

const SOURCE: NodeJS.ProcessEnv = {
  S3_ENDPOINT: 'http://silo:9000',
  S3_PUBLIC_ENDPOINT: 'https://storage.toxictoast.de',
  S3_ACCESS_KEY: 'blog',
  S3_SECRET_KEY: 'secret',
};

describe('s3ConfigFromEnv', () => {
  it('reads the endpoint from the given variable', () => {
    expect(s3ConfigFromEnv('S3_PUBLIC_ENDPOINT', SOURCE)).toEqual({
      endpoint: 'https://storage.toxictoast.de',
      region: 'us-east-1',
      accessKeyId: 'blog',
      secretAccessKey: 'secret',
    });
  });

  it('fails without credentials', () => {
    const { S3_SECRET_KEY: _secret, ...missing } = SOURCE;

    expect(() => s3ConfigFromEnv('S3_ENDPOINT', missing)).toThrow(
      'S3_SECRET_KEY',
    );
  });
});
