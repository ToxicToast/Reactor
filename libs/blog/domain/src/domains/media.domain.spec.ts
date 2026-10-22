import type { DomainContext } from '@toxictoast/shared-kernel';
import { MediaStatus } from '../enums/index.js';
import { MediaFactory } from '../factories/index.js';
import type { MediaData } from '../data/index.js';
import type { MediaDomain } from './media.domain.js';

const NOW = new Date('2026-10-19T12:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'id-1' as never },
  date: { now: () => NOW },
};

const VALID_DATA: MediaData = {
  filename: 'hero.png',
  mime_type: 'image/png',
  size: 1024,
  alt_text: null,
};

describe('MediaDomain', () => {
  const factory = new MediaFactory(ctx);

  const createMedia = (data: Partial<MediaData> = {}): MediaDomain => {
    const result = factory.createDomain({ ...VALID_DATA, ...data });
    if (result.isFailure) {
      throw result.error;
    }
    const media = result.value;
    media.toEvents();
    return media;
  };

  describe('createDomain', () => {
    it('creates pending media with object key and CreateMediaEvent', () => {
      const result = factory.createDomain(VALID_DATA);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic()).toMatchObject({
        object_key: 'media/id-1.png',
        filename: 'hero.png',
        status: MediaStatus.PENDING,
      });
      expect(result.value.isReady).toBe(false);
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'create',
      ]);
    });

    it('builds an object key without extension', () => {
      const media = createMedia({ filename: 'hero' });

      expect(media.toAnemic().object_key).toBe('media/id-1');
    });

    it('lowercases the extension', () => {
      const media = createMedia({ filename: 'Hero.PNG' });

      expect(media.toAnemic().object_key).toBe('media/id-1.png');
    });

    it('trims filename and alt text', () => {
      const anemic = createMedia({
        filename: '  hero.png  ',
        alt_text: '  Ein Space Marine  ',
      }).toAnemic();

      expect(anemic.filename).toBe('hero.png');
      expect(anemic.alt_text).toBe('Ein Space Marine');
    });

    it.each([
      ['empty filename', { filename: '   ' }],
      ['disallowed type', { mime_type: 'application/pdf' }],
      ['zero size', { size: 0 }],
      ['too large', { size: 11 * 1024 * 1024 }],
      ['alt text too long', { alt_text: 'a'.repeat(501) }],
    ])('fails on %s', (_, data) => {
      const result = factory.createDomain({ ...VALID_DATA, ...data });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('markReady', () => {
    it('marks the media ready with the actual size', () => {
      const media = createMedia();

      const result = media.markReady(2048);

      expect(result.isSuccess).toBe(true);
      expect(media.isReady).toBe(true);
      expect(media.toAnemic()).toMatchObject({
        status: MediaStatus.READY,
        size: 2048,
        updated_at: NOW,
      });
      expect(media.toEvents().map((e) => e.event_name)).toEqual(['ready']);
    });

    it('refuses an actual size above the limit', () => {
      const media = createMedia();

      const result = media.markReady(11 * 1024 * 1024);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
      expect(media.isReady).toBe(false);
    });

    it('refuses to mark ready twice', () => {
      const media = createMedia();
      media.markReady(2048);

      const result = media.markReady(2048);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('refuses deleted media', () => {
      const media = createMedia();
      media.deleteMedia();

      const result = media.markReady(2048);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('updateAltText', () => {
    it('updates and trims the alt text', () => {
      const media = createMedia();

      const result = media.updateAltText('  Neuer Text  ');

      expect(result.isSuccess).toBe(true);
      expect(media.toAnemic().alt_text).toBe('Neuer Text');
      expect(media.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('raises no event when nothing changes', () => {
      const media = createMedia({ alt_text: 'Text' });

      media.updateAltText('Text');

      expect(media.toEvents()).toHaveLength(0);
    });

    it('refuses alt text above the limit', () => {
      const media = createMedia();

      const result = media.updateAltText('a'.repeat(501));

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('refuses deleted media', () => {
      const media = createMedia();
      media.deleteMedia();

      const result = media.updateAltText('Neu');

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('deleteMedia / restoreMedia', () => {
    it('soft-deletes and restores the media', () => {
      const media = createMedia();

      media.deleteMedia();
      expect(media.toAnemic().deleted_at).toEqual(NOW);

      media.restoreMedia();
      expect(media.toAnemic().deleted_at).toBeNull();

      expect(media.toEvents().map((e) => e.event_name)).toEqual([
        'delete',
        'restore',
      ]);
    });
  });
});
