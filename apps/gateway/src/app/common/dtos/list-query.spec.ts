import { ListQueryDto } from './list-query.dto.js';

describe('ListQueryDto', () => {
  it('coerces query strings', () => {
    expect(
      ListQueryDto.schema.parse({
        limit: '20',
        offset: '40',
        with_deleted: 'false',
      }),
    ).toEqual({ limit: 20, offset: 40, with_deleted: false });
  });

  it('defaults with_deleted to false', () => {
    expect(ListQueryDto.schema.parse({})).toEqual({ with_deleted: false });
  });

  it('rejects limits above 100', () => {
    expect(ListQueryDto.schema.safeParse({ limit: '500' }).success).toBe(false);
  });
});
