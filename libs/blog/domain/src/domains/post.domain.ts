import {
  BaseDomain,
  ConflictError,
  type Optional,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type { PostAnemic } from '../anemics/index.js';
import type { UpdatePostData } from '../data/index.js';
import { PostStatus } from '../enums/index.js';
import {
  ArchivePostEvent,
  CreatePostEvent,
  DeletePostEvent,
  PublishPostEvent,
  RestorePostEvent,
  UnarchivePostEvent,
  UpdatePostEvent,
} from '../events/index.js';
import {
  ValidatePostExcerpt,
  ValidatePostPublishedAt,
  ValidatePostTitle,
} from '../validations/index.js';
import { ReadingTime } from '../valueObjects/index.js';

export class PostDomain extends BaseDomain<PostAnemic> {
  override toAnemic(): PostAnemic {
    return {
      ...this.state,
      category_ids: [...this.state.category_ids],
      tag_ids: [...this.state.tag_ids],
    };
  }

  createPost(): void {
    this.raise(CreatePostEvent);
  }

  updatePost(data: UpdatePostData): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Post is deleted'));
    }

    const title = data.title?.trim();
    if (title !== undefined) {
      const validation = new ValidatePostTitle(title).validate();
      if (validation.isFailure) {
        return Result.fail(validation.error);
      }
    }

    const excerpt =
      data.excerpt === undefined ? undefined : data.excerpt?.trim() || null;
    if (excerpt !== undefined) {
      const validation = new ValidatePostExcerpt(excerpt).validate();
      if (validation.isFailure) {
        return Result.fail(validation.error);
      }
    }

    const before = this.toAnemic();

    this.state.title = title ?? this.state.title; // Slug bleibt
    this.state.excerpt = excerpt === undefined ? this.state.excerpt : excerpt;
    this.state.featured = data.featured ?? this.state.featured;
    this.state.category_ids = data.category_ids
      ? [...data.category_ids]
      : this.state.category_ids;
    this.state.tag_ids = data.tag_ids ? [...data.tag_ids] : this.state.tag_ids;
    this.state.blog_image_id =
      data.blog_image_id === undefined
        ? this.state.blog_image_id
        : data.blog_image_id;
    this.state.hero_image_id =
      data.hero_image_id === undefined
        ? this.state.hero_image_id
        : data.hero_image_id;

    if (data.content !== undefined) {
      this.state.content = data.content;
      this.state.reading_time = ReadingTime.fromMarkdown(data.content).value;
    }

    if (!this.hasChangedSince(before)) {
      return Result.ok();
    }

    this.touch();
    this.raise(UpdatePostEvent);
    return Result.ok();
  }

  publishPost(publishedAt?: Optional<Date>): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Post is deleted'));
    }
    if (this.state.status !== PostStatus.DRAFT) {
      return Result.fail(new ConflictError('Only drafts can be published'));
    }
    if (!this.state.content.trim()) {
      return Result.fail(new ValidationError('Content must not be empty'));
    }

    const now = this.ctx.date.now();
    const date = publishedAt ?? now;
    const validation = new ValidatePostPublishedAt(date, now).validate();
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }

    this.state.status = PostStatus.PUBLISHED;
    this.state.published_at = date;
    this.touch();
    this.raise(PublishPostEvent);
    return Result.ok();
  }

  archivePost(): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Post is deleted'));
    }
    if (this.state.status !== PostStatus.PUBLISHED) {
      return Result.fail(
        new ConflictError('Only published posts can be archived'),
      );
    }

    this.state.status = PostStatus.ARCHIVED;
    this.touch();
    this.raise(ArchivePostEvent);
    return Result.ok();
  }

  unarchivePost(): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Post is deleted'));
    }
    if (this.state.status !== PostStatus.ARCHIVED) {
      return Result.fail(
        new ConflictError('Only archived posts can be unarchived'),
      );
    }

    this.state.status = PostStatus.PUBLISHED; // published_at bleibt
    this.touch();
    this.raise(UnarchivePostEvent);
    return Result.ok();
  }

  deletePost(): void {
    this.markDeleted(DeletePostEvent);
  }

  restorePost(): void {
    this.markRestored(RestorePostEvent);
  }

  private hasChangedSince(before: PostAnemic): boolean {
    const after = this.toAnemic();
    return (
      before.title !== after.title ||
      before.excerpt !== after.excerpt ||
      before.content !== after.content ||
      before.featured !== after.featured ||
      before.blog_image_id !== after.blog_image_id ||
      before.hero_image_id !== after.hero_image_id ||
      before.category_ids.join() !== after.category_ids.join() ||
      before.tag_ids.join() !== after.tag_ids.join()
    );
  }
}
