import {
  type DomainContext,
  type Factory,
  Result,
} from '@toxictoast/shared-kernel';
import type { PostAnemic } from '../anemics/index.js';
import type { PostData } from '../data/index.js';
import { PostDomain } from '../domains/index.js';
import { PostStatus } from '../enums/index.js';
import {
  ValidatePostExcerpt,
  ValidatePostTitle,
} from '../validations/index.js';
import { ReadingTime, Slug } from '../valueObjects/index.js';

export class PostFactory implements Factory<PostAnemic, PostDomain, PostData> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: PostAnemic): PostDomain {
    return new PostDomain(
      {
        ...anemic,
        category_ids: [...anemic.category_ids],
        tag_ids: [...anemic.tag_ids],
      },
      this.ctx,
    );
  }

  constitute(domain: PostDomain): PostAnemic {
    return domain.toAnemic();
  }

  createDomain(data: PostData): Result<PostDomain> {
    const title = data.title.trim();
    const excerpt = data.excerpt?.trim() || null;

    const validations = [
      new ValidatePostTitle(title),
      new ValidatePostExcerpt(excerpt),
    ];
    for (const validation of validations) {
      const result = validation.validate();
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }

    const slug = Slug.fromTitle(title);
    if (slug.isFailure) {
      return Result.fail(slug.error);
    }

    const domain = new PostDomain(
      {
        id: this.ctx.id.generate<'Post'>(),
        author_id: data.author_id,
        title,
        slug: slug.value.value,
        excerpt,
        content: data.content,
        status: PostStatus.DRAFT,
        featured: data.featured,
        reading_time: ReadingTime.fromMarkdown(data.content).value,
        category_ids: [...data.category_ids],
        tag_ids: [...data.tag_ids],
        blog_image_id: data.blog_image_id,
        hero_image_id: data.hero_image_id,
        published_at: null,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.createPost();
    return Result.ok(domain);
  }
}
