import { IntegrationCheckRegistry } from '@memberjunction/testing-integration';
import { describe, expect, it } from 'vitest';
import { ReferralsWorldChecks } from '../checks/referrals-world.checks.js';

describe('@mj-biz-apps/referrals-integration-tests world model bundles', () => {
  it('registers the referrals-world bundle in IntegrationCheckRegistry', () => {
    expect(ReferralsWorldChecks.length).toBe(3);

    const registered = IntegrationCheckRegistry.Instance.GetBundle('referrals-world');
    expect(registered.map((c) => c.Id)).toEqual([
      'referrals-world.RW1',
      'referrals-world.RW2',
      'referrals-world.RW3',
    ]);
  });
});
