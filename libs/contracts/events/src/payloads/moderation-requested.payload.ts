export interface ModerationRequestedPayloadV1 {
  readonly subject_type: string;
  readonly subject_id: string;
  readonly author_id: string;
  readonly content: string;
}
