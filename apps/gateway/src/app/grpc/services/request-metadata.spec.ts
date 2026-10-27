import { ActorType } from '@toxictoast/shared-kernel';
import { ActorContext, CorrelationContext } from '@toxictoast/shared-system';
import { RequestMetadata } from './request-metadata.service.js';

const CID = '01a16a00-3111-7049-8d8d-0db609f31f2a';

describe('RequestMetadata', () => {
  it('builds the metadata from the actor and correlation id of the request', () => {
    const actors = new ActorContext();
    const correlations = new CorrelationContext();
    const metadata = new RequestMetadata(actors, correlations);

    const result = correlations.run(CID, () =>
      actors.run(
        {
          type: ActorType.USER,
          id: 'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3',
          ip: '203.0.113.7',
          permissions: ['blog.tag.write', 'blog.tag.delete'],
        },
        () => metadata.current(),
      ),
    );

    expect(result.get('x-actor-type')).toEqual(['user']);
    expect(result.get('x-actor-id')).toEqual([
      'a42295ac-be2a-49ea-aeb7-4a6ca8f56af3',
    ]);
    expect(result.get('x-actor-permissions')).toEqual([
      'blog.tag.write,blog.tag.delete',
    ]);
    expect(result.get('x-correlation-id')).toEqual([CID]);
  });
});
