import type { Chatter } from '../interfaces/index.js';
import { ChatterDiffService } from './chatter-diff.service.js';

const chatter = (id: string, login = `user${id}`): Chatter => ({
  user_id: id,
  user_login: login,
  user_name: login,
});

describe('ChatterDiffService', () => {
  const service = new ChatterDiffService();

  it('finds joined and left chatters', () => {
    const diff = service.diff(
      [chatter('1'), chatter('2')],
      [chatter('2'), chatter('3')],
    );

    expect(diff.joined).toEqual([chatter('3')]);
    expect(diff.left).toEqual([chatter('1')]);
  });

  it('treats everyone as joined on the first sync', () => {
    const diff = service.diff([], [chatter('1'), chatter('2')]);

    expect(diff.joined).toEqual([chatter('1'), chatter('2')]);
    expect(diff.left).toEqual([]);
  });

  it('treats everyone as left when the chat is empty', () => {
    const diff = service.diff([chatter('1')], []);

    expect(diff.joined).toEqual([]);
    expect(diff.left).toEqual([chatter('1')]);
  });

  it('ignores renamed chatters', () => {
    const diff = service.diff([chatter('1', 'alt')], [chatter('1', 'neu')]);

    expect(diff.joined).toEqual([]);
    expect(diff.left).toEqual([]);
  });

  it('ignores duplicates in the lists', () => {
    const diff = service.diff([], [chatter('1'), chatter('1')]);

    expect(diff.joined).toEqual([chatter('1')]);
  });
});
