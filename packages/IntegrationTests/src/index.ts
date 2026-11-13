import './checks/referrals-world.checks.js';

export { ReferralLifecycleProbe } from '@mj-biz-apps/referrals-server';
export * from './referrals-fixture.js';
export { ReferralsWorldChecks } from './checks/referrals-world.checks.js';

export const REFERRALS_INTEGRATION_BUNDLES = ['referrals-world'] as const;
