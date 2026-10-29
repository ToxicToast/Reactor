import type {
  ChatMessage as ProtoChatMessage,
  LiveChannel as ProtoLiveChannel,
  StatsChannel as ProtoStatsChannel,
  StreamSession as ProtoStreamSession,
  TwitchEvent as ProtoTwitchEvent,
  TwitchPoll as ProtoTwitchPoll,
} from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import type {
  LiveChannel,
  RecordedTwitchEvent,
  StatsChannel,
} from '@toxictoast/twitch-application';
import {
  SESSION_COUNTER_KEYS,
  type ChatMessage,
  type StoredPoll,
  type StreamSessionAnemic,
} from '@toxictoast/twitch-domain';
import { pickCounters } from '../functions/pick-counters.function.js';

export class TwitchStatsGrpcMapper {
  toChannel(channel: StatsChannel): ProtoStatsChannel {
    return {
      channel_id: channel.channel_id,
      login: channel.channel_login,
      display_name: channel.channel_name,
      live: channel.live,
      current_session_id: channel.current_session_id ?? undefined,
      last_session_at: toIso(channel.last_session_at),
    };
  }

  toSession(session: StreamSessionAnemic): ProtoStreamSession {
    return {
      id: session.id,
      channel_id: session.channel_id,
      channel_login: session.channel_login,
      channel_name: session.channel_name,
      stream_id: session.stream_id,
      started_at: session.started_at.toISOString(),
      ended_at: toIso(session.ended_at),
      duration_seconds: session.duration_seconds ?? undefined,
      peak_chatters: session.peak_chatters,
      unique_chatters: session.unique_chatters,
      ...pickCounters(SESSION_COUNTER_KEYS, session),
    };
  }

  toPoll(poll: StoredPoll): ProtoTwitchPoll {
    return {
      poll_id: poll.poll_id,
      channel_id: poll.channel_id,
      title: poll.title,
      choices: poll.choices.map((choice) => ({ ...choice })),
      status: poll.status,
      started_at: poll.started_at.toISOString(),
      ends_at: toIso(poll.ends_at),
      ended_at: toIso(poll.ended_at),
    };
  }

  toChatMessage(message: ChatMessage): ProtoChatMessage {
    return {
      message_id: message.message_id,
      channel_id: message.channel_id,
      user_id: message.user_id,
      user_login: message.user_login,
      user_name: message.user_name,
      text: message.text,
      color: message.color ?? undefined,
      badges: [...message.badges],
      bits: message.bits,
      reply_to_message_id: message.reply_to_message_id ?? undefined,
      session_id: message.session_id ?? undefined,
      sent_at: message.sent_at.toISOString(),
      deleted_at: toIso(message.deleted_at),
      deleted_reason: message.deleted_reason ?? undefined,
    };
  }

  toLiveChannel(channel: LiveChannel): ProtoLiveChannel {
    return {
      channel_id: channel.channel_id,
      login: channel.channel_login,
      display_name: channel.channel_name,
      live: channel.live,
      session_id: channel.session_id ?? undefined,
      started_at: toIso(channel.started_at),
      chatters: channel.chatters,
    };
  }

  toEvent(event: RecordedTwitchEvent): ProtoTwitchEvent {
    return {
      event_id: event.event_id,
      topic: event.topic,
      name: event.name,
      channel_id: event.channel_id,
      occurred_at: event.occurred_at.toISOString(),
      payload_json: JSON.stringify(event.payload),
    };
  }
}
