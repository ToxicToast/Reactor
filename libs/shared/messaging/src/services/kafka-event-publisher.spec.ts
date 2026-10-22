import type { Producer } from '@platformatic/kafka';
import { ActorType } from '@toxictoast/shared-kernel';
import type { PublishedEvent } from '../interfaces/index.js';
import { KafkaEventPublisher } from './kafka-event-publisher.service.js';

const EVENT: PublishedEvent = {
  event_id: '0192f3a0-0000-7000-8000-000000000001',
  event_namespace: 'blog.post',
  event_name: 'publish',
  event_version: 1,
  aggregate_id: '0192f3a0-0000-7000-8000-0000000000aa',
  occurred_at: new Date('2026-10-20T12:00:00Z'),
  actor: { type: ActorType.USER, id: 'user-1', ip: '203.0.113.7' },
  payload: { title: 'Warhammer' },
};

describe('KafkaEventPublisher', () => {
  let send: jest.Mock;
  let publisher: KafkaEventPublisher;

  beforeEach(() => {
    send = jest.fn().mockResolvedValue({ offsets: [] });
    publisher = new KafkaEventPublisher({
      send,
    } as unknown as Producer<string, string, string, string>);
  });

  it('sends the event to the topic of its namespace, keyed by aggregate', async () => {
    await publisher.publish([EVENT]);

    expect(send).toHaveBeenCalledWith({
      messages: [
        {
          topic: 'blog.post',
          key: EVENT.aggregate_id,
          value: JSON.stringify(EVENT),
          headers: {
            event_id: EVENT.event_id,
            event_name: 'publish',
            event_version: '1',
          },
        },
      ],
    });
  });

  it('serializes the complete event as value', async () => {
    await publisher.publish([EVENT]);

    const value = JSON.parse(send.mock.calls[0][0].messages[0].value);
    expect(value).toEqual({
      ...EVENT,
      occurred_at: '2026-10-20T12:00:00.000Z',
    });
  });

  it('does not call kafka without events', async () => {
    await publisher.publish([]);

    expect(send).not.toHaveBeenCalled();
  });

  it('propagates send errors', async () => {
    send.mockRejectedValue(new Error('broker down'));

    await expect(publisher.publish([EVENT])).rejects.toThrow('broker down');
  });
});
