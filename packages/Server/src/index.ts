import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Metadata, UserInfo } from '@memberjunction/core';
import { ReferralsEngineBase } from '@mj-biz-apps/referrals-entities';
import { LoadReferralsServerEntities } from '@mj-biz-apps/referrals-entities-server';
import { LoadReferralsActions } from '@mj-biz-apps/referrals-actions';
import { ReferralLifecycleProbe } from './probes/ReferralLifecycleProbe.js';
import { ReferralsSlaSweepScheduler } from './SweepScheduler.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const RESOLVER_PATHS: string[] = [
  resolve(__dirname, 'generated/*.js'),
  resolve(__dirname, 'generated/graphql-schemas/*.js'),
];

export * from '@mj-biz-apps/referrals-entities';
export * from '@mj-biz-apps/referrals-core';
export * from '@mj-biz-apps/referrals-entities-server';
export * from '@mj-biz-apps/referrals-actions';
export * from './generated/generated.js';
export {
  BaseLiveCrudVerifier,
  ReferralLifecycleProbe,
  type HealthProbeContext,
  type LiveCrudVerifierResult,
} from './probes/ReferralLifecycleProbe.js';
export { ReferralsSlaSweepScheduler, type SlaSweepRunRecord, type ReciprocityRunRecord } from './SweepScheduler.js';

export interface LoadBizAppsReferralsServerOptions {
  contextUser?: UserInfo;
  sweepIntervalMs?: number;
  disableAutoSweep?: boolean;
  /**
   * Key for the `BaseEscalationNotifier` @RegisterClass implementation to notify on new
   * escalations. Defaults to `'BizAppsTasks'`; falls back to `'None'` if that notifier
   * is not resolvable (e.g. the sibling BizApps Tasks app isn't installed in this tenant).
   */
  escalationNotifierKey?: string;
  /** Disables the daily automatic ReciprocitySnapshot recompute pass. */
  disableAutoReciprocity?: boolean;
  /** Interval in ms between automatic reciprocity recompute passes. Defaults to 24h. */
  reciprocityIntervalMs?: number;
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
  // Preserve side-effect @RegisterClass / @RegisterForStartup registrations
  void ReferralsEngineBase;
  void ReferralLifecycleProbe;

  if (!options?.disableAutoSweep) {
    registerShutdownHooks();
    ReferralsSlaSweepScheduler.Start(resolveSystemUser(options?.contextUser), options?.sweepIntervalMs, {
      escalationNotifierKey: options?.escalationNotifierKey ?? 'BizAppsTasks',
      disableAutoReciprocity: options?.disableAutoReciprocity,
      reciprocityIntervalMs: options?.reciprocityIntervalMs,
    });
  }
}

export function ShutdownBizAppsReferralsServer(): void {
  ReferralsSlaSweepScheduler.Stop();
}
