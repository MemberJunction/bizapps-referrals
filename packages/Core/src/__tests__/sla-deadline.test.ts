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
  it('adds the full tier SLAResponseHours for Standard urgency', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), 'Standard');
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('adds the full tier SLAResponseHours for Low urgency', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), 'Low');
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('defaults to Standard when urgency is omitted', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier());
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('compresses the SLA window by UrgentSLAMultiplier for Urgent', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), 'Urgent');
    expect(deadline.toISOString()).toBe('2026-01-01T12:00:00.000Z');
  });

  it('half-compresses the SLA window for High urgency: tierHours * ((1 + multiplier) / 2)', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier(), 'High');
    // 24 * ((1 + 0.5) / 2) = 24 * 0.75 = 18h
    expect(deadline.toISOString()).toBe('2026-01-01T18:00:00.000Z');
  });

  it('falls back to a 24-hour SLA when SLAResponseHours is non-positive', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier({ SLAResponseHours: 0 }), 'Standard');
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('ignores a non-positive UrgentSLAMultiplier and uses the full SLA window', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(offeredAt, makeTier({ UrgentSLAMultiplier: 0 }), 'Urgent');
    expect(deadline.toISOString()).toBe('2026-01-02T00:00:00.000Z');
  });

  it('clamps the effective SLA window to at least 1 hour', () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    const deadline = CapacityReadinessService.ComputeSLADeadline(
      offeredAt,
      makeTier({ SLAResponseHours: 1, UrgentSLAMultiplier: 0.01 }),
      'Urgent',
    );
    // 1 * 0.01 = 0.01h, clamped up to 1h
    expect(deadline.toISOString()).toBe('2026-01-01T01:00:00.000Z');
  });
});
