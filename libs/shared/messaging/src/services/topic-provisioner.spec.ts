import type { Admin } from '@platformatic/kafka';
import { TopicProvisioner } from './topic-provisioner.service.js';

const OPTIONS = { partitions: 3, replicas: 1 };

const fakeAdmin = (existing: Array<string>) => {
  const admin = {
    listTopics: jest.fn(async () => [...existing]),
    createTopics: jest.fn(async ({ topics }: { topics: Array<string> }) => {
      existing.push(...topics);
      return [];
    }),
    close: jest.fn(async () => undefined),
    incrementalAlterConfigs: jest.fn().mockResolvedValue(undefined),
  };
  return admin;
};

describe('TopicProvisioner', () => {
  it('creates only the missing topics', async () => {
    const admin = fakeAdmin(['blog.post']);
    const provisioner = new TopicProvisioner(
      admin as unknown as Admin,
      ['blog.post', 'blog.tag', 'moderation', 'moderation'],
      OPTIONS,
    );

    const created = await provisioner.provision();

    expect(created).toEqual(['blog.tag', 'moderation']);
    expect(admin.createTopics).toHaveBeenCalledWith({
      topics: ['blog.tag', 'moderation'],
      partitions: 3,
      replicas: 1,
    });
    expect(admin.close).toHaveBeenCalled();
  });

  it('does nothing when all topics exist', async () => {
    const admin = fakeAdmin(['blog.post']);
    const provisioner = new TopicProvisioner(
      admin as unknown as Admin,
      ['blog.post'],
      OPTIONS,
    );

    expect(await provisioner.provision()).toEqual([]);
    expect(admin.createTopics).not.toHaveBeenCalled();
    expect(admin.close).toHaveBeenCalled();
  });

  it('accepts topics another instance created in the meantime', async () => {
    const existing: Array<string> = [];
    const admin = fakeAdmin(existing);
    admin.createTopics.mockImplementationOnce(async () => {
      existing.push('blog.post');
      throw new Error('TOPIC_ALREADY_EXISTS');
    });
    const provisioner = new TopicProvisioner(
      admin as unknown as Admin,
      ['blog.post'],
      OPTIONS,
    );

    await expect(provisioner.provision()).resolves.toEqual(['blog.post']);
  });

  it('rethrows when topics are still missing and closes the admin', async () => {
    const admin = fakeAdmin([]);
    admin.createTopics.mockRejectedValueOnce(new Error('not authorized'));
    const provisioner = new TopicProvisioner(
      admin as unknown as Admin,
      ['blog.post'],
      OPTIONS,
    );

    await expect(provisioner.provision()).rejects.toThrow('not authorized');
    expect(admin.close).toHaveBeenCalled();
  });

  it('sets the retention of configured topics, also when they exist', async () => {
    const admin = fakeAdmin([]);
    const provisioner = new TopicProvisioner(admin as never, ['security.ip'], {
      ...OPTIONS,
      retentionMs: { 'security.ip': 2592000000, 'other.topic': 1000 },
    });

    await provisioner.provision();

    expect(admin.incrementalAlterConfigs).toHaveBeenCalledWith({
      resources: [
        {
          resourceType: 2,
          resourceName: 'security.ip',
          configs: [
            { name: 'retention.ms', configOperation: 0, value: '2592000000' },
          ],
        },
      ],
    });
  });
});
