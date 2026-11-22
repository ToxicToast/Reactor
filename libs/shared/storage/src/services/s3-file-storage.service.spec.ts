import {
  DeleteObjectCommand,
  HeadObjectCommand,
  NotFound,
  S3ServiceException,
  type S3Client,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { createS3Client } from '../factories/index.js';
import { S3FileStorage } from './s3-file-storage.service.js';

const signer = createS3Client({
  endpoint: 'https://storage.toxictoast.de',
  region: 'eu-central-1',
  accessKeyId: 'blog',
  secretAccessKey: 'secret',
});

describe('S3FileStorage', () => {
  let send: jest.Mock;
  let storage: S3FileStorage;

  beforeEach(() => {
    send = jest.fn();
    storage = new S3FileStorage(
      { send } as unknown as S3Client,
      signer,
      'blog',
      'https://storage.toxictoast.de',
    );
  });

  it('signs upload urls for the public endpoint', async () => {
    const url = new URL(
      await storage.createUploadUrl('media/1.png', 'image/png', 300),
    );

    expect(url.origin).toBe('https://storage.toxictoast.de');
    expect(url.pathname).toBe('/blog/media/1.png');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('300');
    expect(url.searchParams.get('X-Amz-SignedHeaders')).toContain(
      'content-type',
    );
  });

  it('signs download urls for the public endpoint', async () => {
    const url = new URL(await storage.createDownloadUrl('media/1.png', 60));

    expect(url.origin).toBe('https://storage.toxictoast.de');
    expect(url.searchParams.get('X-Amz-Expires')).toBe('60');
  });

  it('returns size and mime type of a stored file', async () => {
    send.mockResolvedValue({ ContentLength: 2048, ContentType: 'image/png' });

    const file = await storage.stat('media/1.png');

    expect(file).toEqual({ size: 2048, mime_type: 'image/png' });
    expect(send.mock.calls[0][0]).toBeInstanceOf(HeadObjectCommand);
  });

  it('returns null when the file does not exist', async () => {
    send.mockRejectedValue(new NotFound({ message: 'nope', $metadata: {} }));

    expect(await storage.stat('media/1.png')).toBeNull();
  });

  it('returns null on a plain 404', async () => {
    send.mockRejectedValue(
      new S3ServiceException({
        name: 'Unknown',
        $fault: 'client',
        $metadata: { httpStatusCode: 404 },
      }),
    );

    expect(await storage.stat('media/1.png')).toBeNull();
  });

  it('rethrows other errors', async () => {
    send.mockRejectedValue(new Error('connection refused'));

    await expect(storage.stat('media/1.png')).rejects.toThrow(
      'connection refused',
    );
  });

  it('deletes a file', async () => {
    send.mockResolvedValue({});

    await storage.delete('media/1.png');

    expect(send.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
  });

  it('copies a file inside the bucket', async () => {
    send.mockResolvedValue({});

    await storage.copy('media/1.png', 'public/1');

    const command = send.mock.calls[0][0] as CopyObjectCommand;
    expect(command).toBeInstanceOf(CopyObjectCommand);
    expect(command.input).toEqual({
      Bucket: 'blog',
      Key: 'public/1',
      CopySource: 'blog/media%2F1.png',
    });
  });

  it('builds a fixed public url', () => {
    expect(storage.publicUrl('public/1')).toBe(
      'https://storage.toxictoast.de/blog/public/1',
    );
  });
});
