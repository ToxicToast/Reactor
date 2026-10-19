import { sharedApplication } from './shared-application.js';

describe('sharedApplication', () => {
  it('should work', () => {
    expect(sharedApplication()).toEqual('shared-application');
  });
});
