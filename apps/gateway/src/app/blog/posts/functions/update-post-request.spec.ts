import { UpdatePostDto } from '../dtos/index.js';
import { updatePostRequest } from './update-post-request.function.js';

const ID = '01a169da-79a3-70cd-970c-10e315efa84c';

describe('updatePostRequest', () => {
  it('masks only the fields present in the body', () => {
    const body = UpdatePostDto.schema.parse({ title: 'Neu' });

    expect(updatePostRequest(ID, body)).toMatchObject({
      id: ID,
      title: 'Neu',
      update_mask: ['title'],
    });
  });

  it('clears nullable fields with null', () => {
    const body = UpdatePostDto.schema.parse({
      excerpt: null,
      hero_image_id: null,
    });

    const request = updatePostRequest(ID, body);

    expect(request.update_mask).toEqual(['excerpt', 'hero_image_id']);
    expect(request.excerpt).toBeUndefined();
    expect(request.hero_image_id).toBeUndefined();
  });

  it('strips unknown fields before they reach the mask', () => {
    const body = UpdatePostDto.schema.parse({ title: 'Neu', author_id: ID });

    expect(updatePostRequest(ID, body).update_mask).toEqual(['title']);
  });

  it('rejects an empty body', () => {
    expect(UpdatePostDto.schema.safeParse({}).success).toBe(false);
  });
});
