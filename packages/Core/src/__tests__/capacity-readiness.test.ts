import { describe, expect, it } from 'vitest';
import type { ProfessionalAvailabilityWindowEntity, ProfessionalProfileEntity } from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from '../index.js';

type WindowLike = Pick<
  ProfessionalAvailabilityWindowEntity,
  'WindowType' | 'DayOfWeek' | 'StartTimeMinutes' | 'EndTimeMinutes' | 'StartDate' | 'EndDate' | 'IsAvailable'
>;

function makeProfile(overrides: Partial<ProfessionalProfileEntity> = {}): ProfessionalProfileEntity {
  return {
    AvailabilityStatus: 'Available',
    ActiveReferralCount: 2,
    MaxConcurrentReferrals: 10,
    AverageResponseHours: 4,
    AverageRating: 4.5,
    ReciprocityIndex: 50,
    ...overrides,
  } as ProfessionalProfileEntity;
}

function makeWindow(overrides: Partial<WindowLike>): WindowLike {
  return {
    WindowType: 'Recurring',
    DayOfWeek: null,
    StartTimeMinutes: null,
    EndTimeMinutes: null,
    StartDate: null,
    EndDate: null,
    IsAvailable: true,
    ...overrides,
  } as WindowLike;
}

describe('CapacityReadinessService.ResolveEffectiveAvailability', () => {
  it('falls back to AvailabilityStatus when no windows are configured', () => {
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), [])).toBe(true);
    expect(
      CapacityReadinessService.ResolveEffectiveAvailability(makeProfile({ AvailabilityStatus: 'Unavailable' }), []),
    ).toBe(false);
  });

  it('is unavailable during a Blackout window even when AvailabilityStatus is Available', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'Blackout',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
        IsAvailable: false,
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(false);
  });

  it('requires a matching Recurring window for the day/time when any exist for that day', () => {
    const monday = new Date('2026-06-15T15:00:00.000Z'); // Monday, 15:00 UTC = 900 minutes
    const windows = [makeWindow({ WindowType: 'Recurring', DayOfWeek: monday.getUTCDay(), StartTimeMinutes: 480, EndTimeMinutes: 1020 })];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, monday)).toBe(true);

    const outsideWindow = new Date('2026-06-15T23:00:00.000Z'); // 1380 minutes, outside 480-1020
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, outsideWindow)).toBe(false);
  });
});

describe('CapacityReadinessService.ComputeReadinessScore', () => {
  it('produces a 5-factor breakdown summing to TotalScore, capped at 100', () => {
    const breakdown = CapacityReadinessService.ComputeReadinessScore(makeProfile(), []);
    const sum = breakdown.AvailabilityFactor + breakdown.CapacityFactor + breakdown.ResponsivenessFactor + breakdown.RatingFactor + breakdown.ReciprocityFactor;
    expect(Math.round(sum * 100) / 100).toBe(breakdown.TotalScore);
    expect(breakdown.TotalScore).toBeLessThanOrEqual(100);
    expect(breakdown.TotalScore).toBeGreaterThan(0);
  });

  it('scores an unavailable, over-capacity professional lower than an available one with headroom', () => {
    const goodBreakdown = CapacityReadinessService.ComputeReadinessScore(
      makeProfile({ ActiveReferralCount: 1, MaxConcurrentReferrals: 10 }),
      [],
    );
    const poorBreakdown = CapacityReadinessService.ComputeReadinessScore(
      makeProfile({ AvailabilityStatus: 'Unavailable', ActiveReferralCount: 10, MaxConcurrentReferrals: 10 }),
      [],
    );
    expect(goodBreakdown.TotalScore).toBeGreaterThan(poorBreakdown.TotalScore);
    expect(poorBreakdown.AvailabilityFactor).toBe(0);
    expect(poorBreakdown.CapacityFactor).toBe(0);
  });
});
