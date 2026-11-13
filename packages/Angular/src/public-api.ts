export * from './lib/services/referrals-ui-state.service.js';
export * from './lib/components/seeker-intake.component.js';
export * from './lib/components/pro-inbox.component.js';
export * from './lib/components/ops-telemetry.component.js';
export * from './lib/form-panels/referrals-form-panels.js';

export function LoadBizAppsReferralsClient(): void {
  // Ensures module side-effect @RegisterClass / @RegisterClassEx registrations are preserved.
}
