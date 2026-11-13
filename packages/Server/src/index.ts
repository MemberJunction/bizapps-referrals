import '@mj-biz-apps/referrals-entities';
import { LoadReferralsServerEntities } from '@mj-biz-apps/referrals-entities-server';
import { LoadReferralsActions } from '@mj-biz-apps/referrals-actions';
import { ReferralLifecycleProbe } from './probes/ReferralLifecycleProbe.js';

export * from '@mj-biz-apps/referrals-entities';
export * from '@mj-biz-apps/referrals-core';
export * from '@mj-biz-apps/referrals-entities-server';
export * from '@mj-biz-apps/referrals-actions';
export * from './generated/generated.js';
export { ReferralLifecycleProbe } from './probes/ReferralLifecycleProbe.js';
export { ReferralsSlaSweepScheduler, type SlaSweepRunRecord } from './SweepScheduler.js';

export function LoadBizAppsReferralsServer(): void {
  LoadReferralsServerEntities();
  LoadReferralsActions();
  // Preserve side-effect @RegisterClass registration for ReferralLifecycleProbe
  void ReferralLifecycleProbe;
}
