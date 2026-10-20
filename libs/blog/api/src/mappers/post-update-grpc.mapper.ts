import type { UpdatePostInput } from '@toxictoast/blog-application';
import type { UpdatePostRequest } from '@toxictoast/contracts-grpc';
import { parseId, parseMask, parseOptionalId } from '@toxictoast/shared-grpc';
import type { Mutable } from '@toxictoast/shared-kernel';
import { POST_UPDATE_FIELDS } from '../constants/index.js';

export class PostUpdateGrpcMapper {
  toInput(request: UpdatePostRequest): UpdatePostInput {
    const mask = parseMask(request.update_mask, POST_UPDATE_FIELDS);
    const input: Mutable<UpdatePostInput> = { id: parseId(request.id) };

    if (mask.has('title')) {
      input.title = request.title;
    }
    if (mask.has('excerpt')) {
      input.excerpt = request.excerpt ?? null;
    }
    if (mask.has('content')) {
      input.content = request.content;
    }
    if (mask.has('featured')) {
      input.featured = request.featured;
    }
    if (mask.has('category_ids')) {
      input.category_ids = request.category_ids.map((id) => {
        return parseId(id, 'category_ids');
      });
    }
    if (mask.has('tag_ids')) {
      input.tag_ids = request.tag_ids.map((id) => parseId(id, 'tag_ids'));
    }
    if (mask.has('blog_image_id')) {
      input.blog_image_id = parseOptionalId(
        request.blog_image_id,
        'blog_image_id',
      );
    }
    if (mask.has('hero_image_id')) {
      input.hero_image_id = parseOptionalId(
        request.hero_image_id,
        'hero_image_id',
      );
    }

    return input;
  }
}
