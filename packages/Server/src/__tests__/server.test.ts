import { describe, expect, it, vi } from 'vitest';

vi.mock('../../dist/generated/generated.js', () => ({}));
vi.mock('../generated/generated.js', () => ({}));

import { UserInfo } from '@memberjunction/core';
import { MJGlobal } from '@memberjunction/global';
import { BaseLiveCrudVerifier } from '@memberjunction/health';
import {
  LoadBizAppsReferralsServer,
  ReferralLifecycleProbe,
  ReferralsSlaSweepScheduler,
  ShutdownBizAppsReferralsServer,
} from '../index.js';

describe('@mj-biz-apps/referrals-server', () => {
  it('exports and registers LoadBizAppsReferralsServer, ReferralLifecycleProbe, and starts automated SLA sweep scheduler', () => {
    ReferralsSlaSweepScheduler.Stop();
    expect(typeof LoadBizAppsReferralsServer).toBe('function');
    expect(() => LoadBizAppsReferralsServer()).not.toThrow();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(true);

    const probe = MJGlobal.Instance.ClassFactory.CreateInstance<BaseLiveCrudVerifier>(
      BaseLiveCrudVerifier,
      'BIZAPPS.REFERRALS.LIVE.LIFECYCLE_PROBE',
    );
    expect(probe).toBeInstanceOf(ReferralLifecycleProbe);
    expect(probe?.OwnerApp).toBe('mj-bizapps-referrals');

    ShutdownBizAppsReferralsServer();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(false);
  });

  it('starts and stops ReferralsSlaSweepScheduler cleanly', () => {
    const user = new UserInfo(undefined, { ID: '11111111-1111-1111-1111-111111111111', Name: 'System' });
    ReferralsSlaSweepScheduler.Stop();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(false);

    ReferralsSlaSweepScheduler.Start(user, 60_000);
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(true);

    // Calling Start again is idempotent
    ReferralsSlaSweepScheduler.Start(user, 60_000);
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(true);

    ReferralsSlaSweepScheduler.Stop();
    expect(ReferralsSlaSweepScheduler.IsRunning).toBe(false);
  });
});
