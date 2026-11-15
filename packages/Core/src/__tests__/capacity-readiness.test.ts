import { describe, expect, it } from 'vitest';
import type {
  ProfessionalAvailabilityWindowEntity,
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
} from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from '../index.js';

type WindowLike = Pick<
  ProfessionalAvailabilityWindowEntity,
  'WindowType' | 'StartsAt' | 'EndsAt' | 'IsActive' | 'CapacityOverride'
>;
type CredentialLike = Pick<ProfessionalCredentialEntity, 'IsPrimary' | 'ExpiresAt' | 'VerificationStatus'>;
type AssignmentLike = Pick<ReferralAssignmentEntity, 'Status' | 'OfferedAt'>;

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
    WindowType: 'Paused',
    StartsAt: null,
    EndsAt: null,
    IsActive: true,
    CapacityOverride: null,
    ...overrides,
  } as WindowLike;
}

function makeCredential(overrides: Partial<CredentialLike>): CredentialLike {
  return {
    IsPrimary: true,
    ExpiresAt: null,
    VerificationStatus: 'Verified',
    ...overrides,
  } as CredentialLike;
}

describe('CapacityReadinessService.ResolveEffectiveAvailability', () => {
  it('falls back to AvailabilityStatus when no windows are configured', () => {
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), []).IsBlocked).toBe(false);
    const blocked = CapacityReadinessService.ResolveEffectiveAvailability(makeProfile({ AvailabilityStatus: 'Unavailable' }), []);
    expect(blocked.IsBlocked).toBe(true);
    expect(blocked.BlockReason).toContain('availability window');
  });

  it('is unavailable during an active OnLeave window even when AvailabilityStatus is Available', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartsAt: new Date('2026-06-10T00:00:00.000Z'),
        EndsAt: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    const result = CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf);
    expect(result.IsBlocked).toBe(true);
    expect(result.BlockReason).toContain('availability window');
    expect(result.EffectiveMaxConcurrent).toBe(0);
  });

  it('is unavailable during an active Paused window', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'Paused',
        StartsAt: new Date('2026-06-10T00:00:00.000Z'),
        EndsAt: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf).IsBlocked).toBe(true);
  });

  it('remains available outside an OnLeave window date range', () => {
    const asOf = new Date('2026-06-25T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartsAt: new Date('2026-06-10T00:00:00.000Z'),
        EndsAt: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf).IsBlocked).toBe(false);
  });

  it('remains available during an active ReducedCapacity window and reports the override as EffectiveMaxConcurrent', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'ReducedCapacity',
        StartsAt: new Date('2026-06-10T00:00:00.000Z'),
        EndsAt: new Date('2026-06-20T00:00:00.000Z'),
        CapacityOverride: 2,
      }),
    ];
    const result = CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf);
    expect(result.IsBlocked).toBe(false);
    expect(result.EffectiveMaxConcurrent).toBe(2);
  });

  it('ignores an inactive (IsActive=false) blocking window', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartsAt: new Date('2026-06-10T00:00:00.000Z'),
        EndsAt: new Date('2026-06-20T00:00:00.000Z'),
        IsActive: false,
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf).IsBlocked).toBe(false);
  });
});

describe('CapacityReadinessService.ComputeReadinessScore', () => {
  it('produces a 5-factor breakdown (Credential/Capacity/Responsiveness/Reliability/Availability) summing to Score, capped at 100', () => {
    const result = CapacityReadinessService.ComputeReadinessScore({ profile: makeProfile() });
    const sum =
      result.Breakdown.Credential +
      result.Breakdown.Capacity +
      result.Breakdown.Responsiveness +
      result.Breakdown.Reliability +
      result.Breakdown.Availability;
    expect(Math.round(sum * 100) / 100).toBe(result.Score);
    expect(result.Score).toBeLessThanOrEqual(100);
    expect(result.Score).toBeGreaterThan(0);
  });

  it('scores an unavailable, over-capacity professional lower than an available one with headroom', () => {
    const good = CapacityReadinessService.ComputeReadinessScore({
      profile: makeProfile({ ActiveReferralCount: 1, MaxConcurrentReferrals: 10 }),
    });
    const poor = CapacityReadinessService.ComputeReadinessScore({
      profile: makeProfile({ AvailabilityStatus: 'Unavailable', ActiveReferralCount: 10, MaxConcurrentReferrals: 10 }),
    });
    expect(good.Score).toBeGreaterThan(poor.Score);
    expect(poor.Breakdown.Availability).toBe(0);
    expect(poor.Breakdown.Capacity).toBe(0);
  });

  // Table-driven fixtures covering each of the 5 named factors (AC-11), per the
  // Spec SS3.2 weights: Credential 25/15/0, Capacity round(25*headroom),
  // Responsiveness 0-20, Reliability max(0, 20-5*breaches90d), Availability 10/5/0.
  const asOf = new Date('2026-06-15T12:00:00.000Z');
  const fixtures: Array<{
    name: string;
    profile: Partial<ProfessionalProfileEntity>;
    windows?: WindowLike[];
    credentials?: CredentialLike[];
    expect: (breakdown: ReturnType<typeof CapacityReadinessService.ComputeReadinessScore>['Breakdown']) => void;
  }> = [
    {
      name: 'an expired primary credential yields Credential === 0',
      profile: {},
      credentials: [makeCredential({ IsPrimary: true, VerificationStatus: 'Expired' })],
      expect: (b) => expect(b.Credential).toBe(0),
    },
    {
      name: 'a revoked primary credential yields Credential === 0',
      profile: {},
      credentials: [makeCredential({ IsPrimary: true, VerificationStatus: 'Revoked' })],
      expect: (b) => expect(b.Credential).toBe(0),
    },
    {
      name: 'a primary credential expiring within 30 days yields the partial Credential factor (15)',
      profile: {},
      credentials: [
        makeCredential({
          IsPrimary: true,
          VerificationStatus: 'Verified',
          ExpiresAt: new Date(asOf.getTime() + 15 * 24 * 60 * 60 * 1000),
        }),
      ],
      expect: (b) => expect(b.Credential).toBe(15),
    },
    {
      name: 'a verified primary credential with no near-term expiry yields the full Credential factor (25)',
      profile: {},
      credentials: [makeCredential({ IsPrimary: true, VerificationStatus: 'Verified', ExpiresAt: null })],
      expect: (b) => expect(b.Credential).toBe(25),
    },
    {
      name: 'an active OnLeave window yields Availability === 0',
      profile: {},
      windows: [
        makeWindow({
          WindowType: 'OnLeave',
          StartsAt: new Date('2026-06-10T00:00:00.000Z'),
          EndsAt: new Date('2026-06-20T00:00:00.000Z'),
        }),
      ],
      expect: (b) => expect(b.Availability).toBe(0),
    },
    {
      name: 'an active ReducedCapacity window yields the partial Availability factor (5)',
      profile: {},
      windows: [
        makeWindow({
          WindowType: 'ReducedCapacity',
          StartsAt: new Date('2026-06-10T00:00:00.000Z'),
          EndsAt: new Date('2026-06-20T00:00:00.000Z'),
          CapacityOverride: 2,
        }),
      ],
      expect: (b) => expect(b.Availability).toBe(5),
    },
    {
      name: 'a clean professional with no windows yields the full Availability factor (10)',
      profile: {},
      windows: [],
      expect: (b) => expect(b.Availability).toBe(10),
    },
    {
      name: 'a fast responder (<=2h) yields the full Responsiveness factor (20)',
      profile: { AverageResponseHours: 1.5 },
      expect: (b) => expect(b.Responsiveness).toBe(20),
    },
    {
      name: 'a slow responder (>24h) yields a reduced Responsiveness factor',
      profile: { AverageResponseHours: 48 },
      expect: (b) => expect(b.Responsiveness).toBeLessThan(14),
    },
  ];

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const result = CapacityReadinessService.ComputeReadinessScore({
        profile: makeProfile(fixture.profile),
        windows: fixture.windows ?? [],
        credentials: fixture.credentials ?? [],
        asOf,
      });
      fixture.expect(result.Breakdown);
    });
  }

  it('penalizes Reliability by SLA breaches in the trailing 90 days, floored at 0', () => {
    const clean = CapacityReadinessService.ComputeReadinessScore({ profile: makeProfile(), asOf });
    expect(clean.Breakdown.Reliability).toBe(20);

    const makeExpiredAssignment = (offeredAt: Date): AssignmentLike => ({ Status: 'Expired', OfferedAt: offeredAt } as AssignmentLike);

    const penalized = CapacityReadinessService.ComputeReadinessScore({
      profile: makeProfile(),
      recentAssignments: [
        makeExpiredAssignment(new Date(asOf.getTime() - 10 * 24 * 60 * 60 * 1000)),
        makeExpiredAssignment(new Date(asOf.getTime() - 20 * 24 * 60 * 60 * 1000)),
      ],
      asOf,
    });
    // 20 - 5*2 = 10
    expect(penalized.Breakdown.Reliability).toBe(10);

    const heavilyPenalized = CapacityReadinessService.ComputeReadinessScore({
      profile: makeProfile(),
      recentAssignments: Array.from({ length: 10 }, () => makeExpiredAssignment(new Date(asOf.getTime() - 5 * 24 * 60 * 60 * 1000))),
      asOf,
    });
    expect(heavilyPenalized.Breakdown.Reliability).toBe(0);

    // SLA breaches outside the trailing 90 days do not count.
    const stale = CapacityReadinessService.ComputeReadinessScore({
      profile: makeProfile(),
      recentAssignments: [makeExpiredAssignment(new Date(asOf.getTime() - 120 * 24 * 60 * 60 * 1000))],
      asOf,
    });
    expect(stale.Breakdown.Reliability).toBe(20);
  });
});
