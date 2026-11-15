import { describe, expect, it } from 'vitest';
import type { ReferralTierEntity } from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from '../index.js';

function makeTier(overrides: Partial<ReferralTierEntity> = {}): Pick<ReferralTierEntity, 'SLAResponseHours' | 'UrgentSLAMultiplier'> {
  return {
    SLAResponseHours: 24,
    UrgentSLAMultiplier: 0.5,
    ...overrides,
  } as Pick<ReferralTierEntity, 'SLAResponseHours' | 'UrgentSLAMultiplier'>;
}

describe('CapacityReadinessService.ComputeSLADeadline', () => {
  it('adds the tier SLAResponseHours when not urgent', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), false);
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('compresses the SLA window by UrgentSLAMultiplier when urgent', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), true);
    expect(deadline.toISOString()).toBe('2026-01-01T12:00:00.000Z');
  });

  it('falls back to a 24-hour SLA when SLAResponseHours is non-positive', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier({ SLAResponseHours: 0 }), false);
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('ignores a non-positive UrgentSLAMultiplier and uses the full SLA window', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier({ UrgentSLAMultiplier: 0 }), true);
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });
});
