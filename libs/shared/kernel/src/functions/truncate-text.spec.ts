import { truncateText } from './truncate-text.function.js';

describe('truncateText', () => {
  it('keeps short texts', () => {
    expect(truncateText('Hallo', 5)).toBe('Hallo');
  });

  it('cuts long texts to the limit including the ellipsis', () => {
    const cut = truncateText('Hallo Chat', 6);

    expect(cut).toBe('Hallo…');
    expect(cut).toHaveLength(6);
  });
});
