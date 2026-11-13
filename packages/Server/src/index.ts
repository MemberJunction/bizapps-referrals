import { Metadata, UserInfo } from '@memberjunction/core';
import '@mj-biz-apps/referrals-entities';
import { LoadReferralsServerEntities } from '@mj-biz-apps/referrals-entities-server';
import { LoadReferralsActions } from '@mj-biz-apps/referrals-actions';
import { ReferralLifecycleProbe } from './probes/ReferralLifecycleProbe.js';
import { ReferralsSlaSweepScheduler } from './SweepScheduler.js';

export * from '@mj-biz-apps/referrals-entities';
export * from '@mj-biz-apps/referrals-core';
export * from '@mj-biz-apps/referrals-entities-server';
export * from '@mj-biz-apps/referrals-actions';
export * from './generated/generated.js';
export { ReferralLifecycleProbe } from './probes/ReferralLifecycleProbe.js';
export { ReferralsSlaSweepScheduler, type SlaSweepRunRecord } from './SweepScheduler.js';

export interface LoadBizAppsReferralsServerOptions {
  contextUser?: UserInfo;
  sweepIntervalMs?: number;
  disableAutoSweep?: boolean;
}

let shutdownHooksRegistered = false;

function resolveSystemUser(explicit?: UserInfo): UserInfo {
  if (explicit) {
    return explicit;
  }
  const providerUser = Metadata.Provider?.CurrentUser;
  if (providerUser) {
    return providerUser;
  }
  return new UserInfo(undefined, {
    ID: '00000000-0000-0000-0000-000000000000',
    Name: 'Referrals System Scheduler',
  });
}

function registerShutdownHooks(): void {
  if (shutdownHooksRegistered) {
    return;
  }
  shutdownHooksRegistered = true;
  const stop = () => {
    ReferralsSlaSweepScheduler.Stop();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  process.once('beforeExit', stop);
}

export function LoadBizAppsReferralsServer(options?: LoadBizAppsReferralsServerOptions): void {
  LoadReferralsServerEntities();
  LoadReferralsActions();
  // Preserve side-effect @RegisterClass registration for ReferralLifecycleProbe
  void ReferralLifecycleProbe;

  if (!options?.disableAutoSweep) {
    registerShutdownHooks();
    ReferralsSlaSweepScheduler.Start(resolveSystemUser(options?.contextUser), options?.sweepIntervalMs);
  }
}

export function ShutdownBizAppsReferralsServer(): void {
  ReferralsSlaSweepScheduler.Stop();
}
