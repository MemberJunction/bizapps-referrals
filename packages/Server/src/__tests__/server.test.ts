import { describe, expect, it, vi } from 'vitest';

vi.mock('../../dist/generated/generated.js', () => ({}));
vi.mock('../generated/generated.js', () => ({}));

import { LoadBizAppsReferralsServer } from '../index.js';

describe('@mj-biz-apps/referrals-server', () => {
  it('exports LoadBizAppsReferralsServer', () => {
    expect(typeof LoadBizAppsReferralsServer).toBe('function');
    expect(() => LoadBizAppsReferralsServer()).not.toThrow();
  });
});
