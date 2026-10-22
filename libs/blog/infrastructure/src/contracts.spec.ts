import {
  CreateCategoryEvent,
  CreateCommentEvent,
  CreateMediaEvent,
  CreatePostEvent,
  CreateTagEvent,
  type CategoryAnemic,
  type CommentAnemic,
  type MediaAnemic,
  type PostAnemic,
  type TagAnemic,
  CommentStatus,
  RequestCommentModerationEvent,
} from '@toxictoast/blog-domain';
import { commentAnemic } from '@toxictoast/blog-application';
import {
  BlogTopics,
  type BlogCategoryPayloadV1,
  type BlogCommentPayloadV1,
  type BlogMediaPayloadV1,
  type BlogPostPayloadV1,
  type BlogTagPayloadV1,
  type ModerationDecidedPayloadV1,
  BlogCommentModerationEvents,
  type EventActorV1,
} from '@toxictoast/contracts-events';
import type { ActorIdentity } from '@toxictoast/shared-kernel';

type JsonValue<T> = T extends Date
  ? string
  : T extends string
    ? Record<never, never> extends Omit<T, keyof string>
      ? `${T}`
      : string
    : T extends ReadonlyArray<infer TItem>
      ? ReadonlyArray<JsonValue<TItem>>
      : T;

type Jsonified<T> = {
  [K in keyof T]: JsonValue<T[K]>;
};

type Compatible<TActual, TExpected> = [TActual] extends [TExpected]
  ? [TExpected] extends [TActual]
    ? true
    : false
  : false;

describe('Event contracts', () => {
  it('match the serialized anemics', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<TagAnemic>, BlogTagPayloadV1>,
      true as Compatible<Jsonified<CategoryAnemic>, BlogCategoryPayloadV1>,
      true as Compatible<Jsonified<MediaAnemic>, BlogMediaPayloadV1>,
      true as Compatible<Jsonified<PostAnemic>, BlogPostPayloadV1>,
      true as Compatible<Jsonified<CommentAnemic>, BlogCommentPayloadV1>,
    ];

    expect(checks).toHaveLength(5);
  });

  it('use the topics of the domain namespaces', () => {
    const at = new Date();
    const namespace = (
      EventClass: new (...args: Array<never>) => { event_namespace: string },
    ): string => {
      return new EventClass(...(['event', 'aggregate', at, {}] as Array<never>))
        .event_namespace;
    };

    expect(namespace(CreateTagEvent)).toBe(BlogTopics.TAG);
    expect(namespace(CreateCategoryEvent)).toBe(BlogTopics.CATEGORY);
    expect(namespace(CreateMediaEvent)).toBe(BlogTopics.MEDIA);
    expect(namespace(CreatePostEvent)).toBe(BlogTopics.POST);
    expect(namespace(CreateCommentEvent)).toBe(BlogTopics.COMMENT);
  });

  it('match the moderation contracts', () => {
    const checks: Array<true> = [
      true as Compatible<
        JsonValue<CommentStatus>,
        ModerationDecidedPayloadV1['decision']
      >,
    ];
    const at = new Date();
    const request = new RequestCommentModerationEvent(
      'event',
      'aggregate',
      at,
      commentAnemic('c-1'),
    );

    expect(checks).toHaveLength(1);
    expect(request.event_namespace).toBe(BlogTopics.COMMENT_MODERATION);
    expect(request.event_name).toBe(BlogCommentModerationEvents.REQUESTED);
  });

  it('match the event actor', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<ActorIdentity>, EventActorV1>,
    ];

    expect(checks).toHaveLength(1);
  });
});
