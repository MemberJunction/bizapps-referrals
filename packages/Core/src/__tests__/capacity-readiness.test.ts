import { describe, expect, it } from 'vitest';
import type {
  ProfessionalAvailabilityWindowEntity,
  ProfessionalCredentialEntity,
  ProfessionalProfileEntity,
} from '@mj-biz-apps/referrals-entities';
import { CapacityReadinessService } from '../index.js';

type WindowLike = Pick<
  ProfessionalAvailabilityWindowEntity,
  'WindowType' | 'StartDate' | 'EndDate' | 'IsAvailable' | 'IsActive' | 'CapacityOverride'
>;
type CredentialLike = Pick<ProfessionalCredentialEntity, 'IsPrimary' | 'ExpiresAt' | 'VerificationStatus'>;

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
    StartDate: null,
    EndDate: null,
    IsAvailable: false,
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
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), [])).toBe(true);
    expect(
      CapacityReadinessService.ResolveEffectiveAvailability(makeProfile({ AvailabilityStatus: 'Unavailable' }), []),
    ).toBe(false);
  });

  it('is unavailable during an active OnLeave window even when AvailabilityStatus is Available', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(false);
  });

  it('is unavailable during an active Paused window', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'Paused',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(false);
  });

  it('remains available outside an OnLeave window date range', () => {
    const asOf = new Date('2026-06-25T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(true);
  });

  it('remains available during an active ReducedCapacity window (it reduces capacity, not availability)', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'ReducedCapacity',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
        CapacityOverride: 2,
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(true);
  });

  it('ignores an inactive (IsActive=false) blocking window', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'OnLeave',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
        IsActive: false,
      }),
    ];
    expect(CapacityReadinessService.ResolveEffectiveAvailability(makeProfile(), windows, asOf)).toBe(true);
  });
});

describe('CapacityReadinessService.GetEffectiveCapacityOverride', () => {
  it('returns the active ReducedCapacity window override', () => {
    const asOf = new Date('2026-06-15T12:00:00.000Z');
    const windows = [
      makeWindow({
        WindowType: 'ReducedCapacity',
        StartDate: new Date('2026-06-10T00:00:00.000Z'),
        EndDate: new Date('2026-06-20T00:00:00.000Z'),
        CapacityOverride: 3,
      }),
    ];
    expect(CapacityReadinessService.GetEffectiveCapacityOverride(windows, asOf)).toBe(3);
  });

  it('returns null when no active ReducedCapacity window covers asOfDate', () => {
    expect(CapacityReadinessService.GetEffectiveCapacityOverride([], new Date())).toBeNull();
  });
});

describe('CapacityReadinessService.ComputeReadinessScore', () => {
  it('produces a 5-factor breakdown (Credential/Capacity/Responsiveness/Reliability/Availability) summing to Score, capped at 100', () => {
    const result = CapacityReadinessService.ComputeReadinessScore(makeProfile(), []);
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
    const good = CapacityReadinessService.ComputeReadinessScore(
      makeProfile({ ActiveReferralCount: 1, MaxConcurrentReferrals: 10 }),
      [],
    );
    const poor = CapacityReadinessService.ComputeReadinessScore(
      makeProfile({ AvailabilityStatus: 'Unavailable', ActiveReferralCount: 10, MaxConcurrentReferrals: 10 }),
      [],
    );
    expect(good.Score).toBeGreaterThan(poor.Score);
    expect(poor.Breakdown.Availability).toBe(0);
    expect(poor.Breakdown.Capacity).toBe(0);
  });

  // Table-driven fixtures covering each of the 5 named factors (AC-11).
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
      name: 'a primary credential expiring within 30 days yields a partial Credential factor',
      profile: {},
      credentials: [
        makeCredential({
          IsPrimary: true,
          VerificationStatus: 'Verified',
          ExpiresAt: new Date(asOf.getTime() + 15 * 24 * 60 * 60 * 1000),
        }),
      ],
      expect: (b) => {
        expect(b.Credential).toBeGreaterThan(0);
        expect(b.Credential).toBeLessThan(25);
      },
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
          StartDate: new Date('2026-06-10T00:00:00.000Z'),
          EndDate: new Date('2026-06-20T00:00:00.000Z'),
        }),
      ],
      expect: (b) => expect(b.Availability).toBe(0),
    },
    {
      name: 'an active ReducedCapacity window yields a partial Availability factor (7.5)',
      profile: {},
      windows: [
        makeWindow({
          WindowType: 'ReducedCapacity',
          StartDate: new Date('2026-06-10T00:00:00.000Z'),
          EndDate: new Date('2026-06-20T00:00:00.000Z'),
          CapacityOverride: 2,
        }),
      ],
      expect: (b) => expect(b.Availability).toBe(7.5),
    },
    {
      name: 'a clean professional with no windows yields the full Availability factor (15)',
      profile: {},
      windows: [],
      expect: (b) => expect(b.Availability).toBe(15),
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
    {
      name: 'SLA breaches and declines reduce Reliability below the full 15',
      profile: {},
      expect: () => {
        /* checked via the dedicated reliability assertion below */
      },
    },
  ];

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      const result = CapacityReadinessService.ComputeReadinessScore(
        makeProfile(fixture.profile),
        fixture.windows ?? [],
        fixture.credentials ?? [],
        {},
        asOf,
      );
      fixture.expect(result.Breakdown);
    });
  }

  it('penalizes Reliability by SLA breaches and declines, floored at 0', () => {
    const clean = CapacityReadinessService.ComputeReadinessScore(makeProfile(), [], [], {});
    expect(clean.Breakdown.Reliability).toBe(15);

    const penalized = CapacityReadinessService.ComputeReadinessScore(makeProfile(), [], [], {
      SLABreachCount: 2,
      DeclineCount: 1,
    });
    // 15 - 2*3 - 1*1.5 = 7.5
    expect(penalized.Breakdown.Reliability).toBe(7.5);

    const heavilyPenalized = CapacityReadinessService.ComputeReadinessScore(makeProfile(), [], [], {
      SLABreachCount: 10,
    });
    expect(heavilyPenalized.Breakdown.Reliability).toBe(0);
  });
});
