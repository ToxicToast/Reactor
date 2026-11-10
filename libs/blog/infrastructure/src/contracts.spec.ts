import {
  CategoryEvents,
  CommentEvents,
  CommentModerationEvents,
  CommentStatus,
  MediaEvents,
  PostEvents,
  TagEvents,
  type CategoryEventPayload,
  type CommentEventPayload,
  type MediaEventPayload,
  type PostEventPayload,
  type TagEventPayload,
} from '@toxictoast/blog-domain';
import {
  BlogCategoryEvents,
  BlogCommentEvents,
  BlogCommentModerationEvents,
  BlogMediaEvents,
  BlogPostEvents,
  BlogTagEvents,
  BlogTopics,
  type BlogCategoryPayloadV1,
  type BlogCommentPayloadV1,
  type BlogMediaPayloadV1,
  type BlogPostPayloadV1,
  type BlogTagPayloadV1,
  type EventActorV1,
  type ModerationDecidedPayloadV1,
} from '@toxictoast/contracts-events';
import {
  contractNamesOf,
  eventNamesOf,
  eventNamespacesOf,
  type Compatible,
  type EventDefinitionLike,
  type Jsonified,
  type JsonValue,
} from '@toxictoast/contracts-events/testing';
import type { ActorIdentity } from '@toxictoast/shared-kernel';

describe('Event contracts', () => {
  it('match the serialized payloads', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<TagEventPayload>, BlogTagPayloadV1>,
      true as Compatible<
        Jsonified<CategoryEventPayload>,
        BlogCategoryPayloadV1
      >,
      true as Compatible<Jsonified<MediaEventPayload>, BlogMediaPayloadV1>,
      true as Compatible<Jsonified<PostEventPayload>, BlogPostPayloadV1>,
      true as Compatible<Jsonified<CommentEventPayload>, BlogCommentPayloadV1>,
    ];

    expect(checks).toHaveLength(5);
  });

  it.each<
    [
      string,
      Readonly<Record<string, EventDefinitionLike>>,
      string,
      Readonly<Record<string, string>>,
    ]
  >([
    ['tag', TagEvents, BlogTopics.TAG, BlogTagEvents],
    ['category', CategoryEvents, BlogTopics.CATEGORY, BlogCategoryEvents],
    ['media', MediaEvents, BlogTopics.MEDIA, BlogMediaEvents],
    ['post', PostEvents, BlogTopics.POST, BlogPostEvents],
    ['comment', CommentEvents, BlogTopics.COMMENT, BlogCommentEvents],
  ])(
    'publish the %s events under the contract topic and names',
    (_, definitions, topic, contractNames) => {
      expect(eventNamespacesOf(definitions)).toEqual([topic]);
      expect(eventNamesOf(definitions)).toEqual(contractNamesOf(contractNames));
    },
  );

  it('match the moderation contracts', () => {
    const checks: Array<true> = [
      true as Compatible<
        JsonValue<CommentStatus>,
        ModerationDecidedPayloadV1['decision']
      >,
    ];

    expect(checks).toHaveLength(1);
    expect(eventNamespacesOf(CommentModerationEvents)).toEqual([
      BlogTopics.COMMENT_MODERATION,
    ]);
    expect(CommentModerationEvents.REQUESTED.name).toBe(
      BlogCommentModerationEvents.REQUESTED,
    );
  });

  it('match the event actor', () => {
    const checks: Array<true> = [
      true as Compatible<Jsonified<ActorIdentity>, EventActorV1>,
    ];

    expect(checks).toHaveLength(1);
  });
});
