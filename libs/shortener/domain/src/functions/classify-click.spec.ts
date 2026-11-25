import type { LinkId } from '../types/index.js';
import { classifyClick } from './classify-click.function.js';

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const WINDOWS_EDGE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0';
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const DISCORD =
  'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)';

const raw = (overrides: Partial<Parameters<typeof classifyClick>[0]> = {}) => {
  return classifyClick({
    event_id: 'event-1',
    link_id: 'link-1' as LinkId,
    clicked_at: new Date('2026-11-25T12:00:00Z'),
    referer: null,
    user_agent: null,
    country: null,
    ...overrides,
  });
};

describe('classifyClick', () => {
  it.each([
    [IPHONE_SAFARI, 'mobile', 'safari'],
    [WINDOWS_EDGE, 'desktop', 'edge'],
    [ANDROID_CHROME, 'mobile', 'chrome'],
    [DISCORD, 'bot', 'other'],
  ])('classifies %s', (userAgent, device, browser) => {
    expect(raw({ user_agent: userAgent })).toMatchObject({ device, browser });
  });

  it('marks missing user agents as unknown', () => {
    expect(raw()).toMatchObject({ device: 'unknown', browser: 'unknown' });
  });

  it('keeps only the host of the referer, without www', () => {
    expect(
      raw({ referer: 'https://www.instagram.com/stream.toast/?igsh=abc' })
        .referrer_host,
    ).toBe('instagram.com');
  });

  it('ignores referers that are not urls', () => {
    expect(raw({ referer: 'android-app://com.google' }).referrer_host).toBe(
      'com.google',
    );
    expect(raw({ referer: 'kaputt' }).referrer_host).toBeNull();
  });

  it('normalizes the country code', () => {
    expect(raw({ country: ' de ' }).country).toBe('DE');
    expect(raw({ country: 'DEU' }).country).toBeNull();
  });
});
