import { describe, expect, it } from 'vitest';
import { IMetadataProvider, IRunViewProvider, RunViewParams, RunViewResult, UserInfo } from '@memberjunction/core';
import type { ProfessionalProfileEntity, ReciprocitySnapshotEntity } from '@mj-biz-apps/referrals-entities';
import { CurrentUtcQuarter, ReciprocityScorecardData, ReciprocityScorecardService } from '../index.js';

const PROFILE_ID = '10000000-0000-4000-8000-000000000001';
const OTHER_PROFILE_ID = '10000000-0000-4000-8000-000000000002';

const PERIOD = { Start: new Date('2026-01-01T00:00:00.000Z'), End: new Date('2026-03-31T23:59:59.999Z') };

function withinPeriod(hoursFromStart: number): Date {
  return new Date(PERIOD.Start.getTime() + hoursFromStart * 60 * 60 * 1000);
}

describe('ReciprocityScorecardService.ComputeScorecard', () => {
  it('computes Sent/Received/Accepted/Resolved/SLABreachCount/AcceptanceRate/MedianResponseHours/AttributedFeeTotal and the exact ReciprocityIndex formula', () => {
    const data: ReciprocityScorecardData = {
      requests: [
        { ID: 'r1', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(1) },
        { ID: 'r2', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(2) },
        { ID: 'r3', ReferringProfessionalID: OTHER_PROFILE_ID, SubmittedAt: withinPeriod(3) },
      ],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1.5, OfferedAt: withinPeriod(1), RespondedAt: null },
        { ID: 'a2', ReferralRequestID: 'x2', ProfessionalProfileID: PROFILE_ID, Status: 'Completed', ResponseHours: 2.5, OfferedAt: withinPeriod(2), RespondedAt: null },
        { ID: 'a3', ReferralRequestID: 'x3', ProfessionalProfileID: PROFILE_ID, Status: 'Expired', ResponseHours: null, OfferedAt: withinPeriod(3), RespondedAt: null },
        { ID: 'a4', ReferralRequestID: 'x4', ProfessionalProfileID: PROFILE_ID, Status: 'Declined', ResponseHours: 0.5, OfferedAt: withinPeriod(4), RespondedAt: null },
        { ID: 'a5', ReferralRequestID: 'x5', ProfessionalProfileID: PROFILE_ID, Status: 'ConflictRejected', ResponseHours: null, OfferedAt: withinPeriod(5), RespondedAt: null },
      ],
      outcomes: [
        { ID: 'o1', ReferralAssignmentID: 'a2', ProfessionalProfileID: PROFILE_ID, OutcomeStatus: 'Resolved', ClosedAt: withinPeriod(6), ReportedFeeAmount: 1500 },
        { ID: 'o2', ReferralAssignmentID: 'a1', ProfessionalProfileID: PROFILE_ID, OutcomeStatus: 'Withdrawn', ClosedAt: withinPeriod(7), ReportedFeeAmount: 0 },
      ],
    };

    const scorecard = ReciprocityScorecardService.ComputeScorecard(PROFILE_ID, PERIOD, data);

    // Sent: only requests referred by PROFILE_ID in-period -> r1, r2
    expect(scorecard.Sent).toBe(2);
    // Received: assignments to PROFILE_ID excluding ConflictRejected (a5) -> a1,a2,a3,a4
    expect(scorecard.Received).toBe(4);
    // Accepted: Accepted/InProgress/Completed -> a1, a2
    expect(scorecard.Accepted).toBe(2);
    // SLABreachCount: Expired -> a3
    expect(scorecard.SLABreachCount).toBe(1);
    // Resolved: outcomes with OutcomeStatus='Resolved' -> o1
    expect(scorecard.Resolved).toBe(1);
    // AcceptanceRate is a 0..1 fraction: 2/4
    expect(scorecard.AcceptanceRate).toBe(0.5);
    // MedianResponseHours: median([1.5, 2.5, 0.5]) = 1.5
    expect(scorecard.MedianResponseHours).toBe(1.5);
    // AttributedFeeTotal: sum of FeeAmount across this profile's completed outcomes -> 1500 + 0
    expect(scorecard.AttributedFeeTotal).toBe(1500);
    // ReciprocityIndex = round((Sent + 1) / (Accepted + 1), 3) = round(3/3, 3) = 1
    expect(scorecard.ReciprocityIndex).toBe(1);
  });

  it('AC-26: exact fixture - Accepted=4/Received=5 yields AcceptanceRate=0.8000, MedianResponseHours=2.50, ReciprocityIndex=0.800, SLABreachCount=1', () => {
    const data: ReciprocityScorecardData = {
      requests: [
        { ID: 'r1', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(1) },
        { ID: 'r2', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(2) },
        { ID: 'r3', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(3) },
      ],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1, OfferedAt: withinPeriod(1), RespondedAt: null },
        { ID: 'a2', ReferralRequestID: 'x2', ProfessionalProfileID: PROFILE_ID, Status: 'InProgress', ResponseHours: 2, OfferedAt: withinPeriod(2), RespondedAt: null },
        { ID: 'a3', ReferralRequestID: 'x3', ProfessionalProfileID: PROFILE_ID, Status: 'Completed', ResponseHours: 3, OfferedAt: withinPeriod(3), RespondedAt: null },
        { ID: 'a4', ReferralRequestID: 'x4', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 3, OfferedAt: withinPeriod(4), RespondedAt: null },
        { ID: 'a5', ReferralRequestID: 'x5', ProfessionalProfileID: PROFILE_ID, Status: 'Expired', ResponseHours: null, OfferedAt: withinPeriod(5), RespondedAt: null },
      ],
      outcomes: [],
    };

    const scorecard = ReciprocityScorecardService.ComputeScorecard(PROFILE_ID, PERIOD, data);

    expect(scorecard.Sent).toBe(3);
    expect(scorecard.Received).toBe(5);
    expect(scorecard.Accepted).toBe(4);
    expect(scorecard.SLABreachCount).toBe(1);
    expect(scorecard.AcceptanceRate).toBe(0.8);
    expect(scorecard.MedianResponseHours).toBe(2.5);
    // ReciprocityIndex = round((Sent=3 + 1) / (Accepted=4 + 1), 3) = round(4/5, 3) = 0.8
    expect(scorecard.ReciprocityIndex).toBe(0.8);
  });

  it('returns zeroed AcceptanceRate and a ReciprocityIndex > 1 for a pure net-giver with zero received referrals', () => {
    const data: ReciprocityScorecardData = {
      requests: [
        { ID: 'r1', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(1) },
        { ID: 'r2', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(2) },
      ],
      assignments: [],
      outcomes: [],
    };

    const scorecard = ReciprocityScorecardService.ComputeScorecard(PROFILE_ID, PERIOD, data);

    expect(scorecard.Received).toBe(0);
    expect(scorecard.AcceptanceRate).toBe(0);
    // round((2 + 1) / (0 + 1), 3) = 3
    expect(scorecard.ReciprocityIndex).toBe(3);
  });

  it('excludes requests, assignments, and outcomes outside the period window', () => {
    const outOfPeriod = new Date(PERIOD.End.getTime() + 60 * 60 * 1000);
    const data: ReciprocityScorecardData = {
      requests: [{ ID: 'r1', ReferringProfessionalID: PROFILE_ID, SubmittedAt: outOfPeriod }],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1, OfferedAt: outOfPeriod, RespondedAt: null },
      ],
      outcomes: [
        { ID: 'o1', ReferralAssignmentID: 'a1', ProfessionalProfileID: PROFILE_ID, OutcomeStatus: 'Resolved', ClosedAt: outOfPeriod, ReportedFeeAmount: 500 },
      ],
    };

    const scorecard = ReciprocityScorecardService.ComputeScorecard(PROFILE_ID, PERIOD, data);

    expect(scorecard.Sent).toBe(0);
    expect(scorecard.Received).toBe(0);
    expect(scorecard.Resolved).toBe(0);
    expect(scorecard.AttributedFeeTotal).toBe(0);
  });

  it('Round 2 AC-26 exact fixture: Sent=3/Received=5/Accepted=4/Resolved=2/Expired=1, ResponseHours=[1,2,3,10]', () => {
    const data: ReciprocityScorecardData = {
      requests: [
        { ID: 'r1', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(1) },
        { ID: 'r2', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(2) },
        { ID: 'r3', ReferringProfessionalID: PROFILE_ID, SubmittedAt: withinPeriod(3) },
      ],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1, OfferedAt: withinPeriod(1), RespondedAt: null },
        { ID: 'a2', ReferralRequestID: 'x2', ProfessionalProfileID: PROFILE_ID, Status: 'InProgress', ResponseHours: 2, OfferedAt: withinPeriod(2), RespondedAt: null },
        { ID: 'a3', ReferralRequestID: 'x3', ProfessionalProfileID: PROFILE_ID, Status: 'Completed', ResponseHours: 3, OfferedAt: withinPeriod(3), RespondedAt: null },
        { ID: 'a4', ReferralRequestID: 'x4', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 10, OfferedAt: withinPeriod(4), RespondedAt: null },
        { ID: 'a5', ReferralRequestID: 'x5', ProfessionalProfileID: PROFILE_ID, Status: 'Expired', ResponseHours: null, OfferedAt: withinPeriod(5), RespondedAt: null },
      ],
      outcomes: [
        { ID: 'o1', ReferralAssignmentID: 'a3', ProfessionalProfileID: PROFILE_ID, OutcomeStatus: 'Resolved', ClosedAt: withinPeriod(6), ReportedFeeAmount: 0 },
        { ID: 'o2', ReferralAssignmentID: 'a4', ProfessionalProfileID: PROFILE_ID, OutcomeStatus: 'Resolved', ClosedAt: withinPeriod(7), ReportedFeeAmount: 0 },
      ],
    };

    const scorecard = ReciprocityScorecardService.ComputeScorecard(PROFILE_ID, PERIOD, data);

    expect(scorecard.Sent).toBe(3);
    expect(scorecard.Received).toBe(5);
    expect(scorecard.Accepted).toBe(4);
    expect(scorecard.Resolved).toBe(2);
    expect(scorecard.SLABreachCount).toBe(1);
    expect(scorecard.MedianResponseHours).toBe(2.5);
  });
});

describe('ReciprocityScorecardService.CurrentUtcQuarter', () => {
  it('returns the UTC calendar quarter boundaries containing the given date', () => {
    const period = CurrentUtcQuarter(new Date('2026-02-15T12:00:00.000Z'));
    expect(period.Start.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(period.End.toISOString()).toBe('2026-03-31T23:59:59.999Z');
  });
});

type FieldValue = string | number | boolean | Date | null;

interface MockStore {
  profiles: Map<string, ProfessionalProfileEntity>;
  requests: ReciprocityScorecardData['requests'];
  assignments: ReciprocityScorecardData['assignments'];
  outcomes: ReciprocityScorecardData['outcomes'];
  snapshots: Map<string, ReciprocitySnapshotEntity>;
}

function makeProfile(id: string): ProfessionalProfileEntity {
  const data: Record<string, FieldValue> = {
    ID: id,
    IsActive: true,
    AvailabilityStatus: 'Available',
    MaxConcurrentReferrals: 5,
    ActiveReferralCount: 1,
    AverageResponseHours: 2,
    AverageRating: 4.5,
    ReciprocityIndex: null,
    ReadinessScore: null,
    ReadinessComputedAt: null,
  };
  return data as ProfessionalProfileEntity;
}

class MockReciprocityProvider implements IMetadataProvider, IRunViewProvider {
  public Entities: never[] = [];
  private seq = 1;

  constructor(private readonly store: MockStore) {}

  public async GetEntityObject<T>(entityName: string): Promise<T> {
    if (entityName === 'MJ_BizApps_Referrals: Reciprocity Snapshots') {
      const newId = `20000000-0000-4000-8000-${String(this.seq++).padStart(12, '0')}`;
      const data: Record<string, FieldValue> = { ID: newId };
      Object.assign(data, {
        Save: async () => {
          this.store.snapshots.set(newId.toLowerCase(), { ...data } as ReciprocitySnapshotEntity);
          return true;
        },
      });
      return data as object as T;
    }
    throw new Error(`Unexpected entity '${entityName}'`);
  }

  public async RunView<T>(params: RunViewParams): Promise<RunViewResult<T>> {
    const filter = params.ExtraFilter ?? '';
    if (params.EntityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      return { Success: true, Results: Array.from(this.store.profiles.values()) as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      return { Success: true, Results: this.store.requests as object as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      return { Success: true, Results: this.store.assignments as object as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
      return { Success: true, Results: this.store.outcomes as object as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Reciprocity Snapshots') {
      const match = /ProfessionalProfileID = '([^']+)'/i.exec(filter);
      const existing = match
        ? Array.from(this.store.snapshots.values()).filter((s) => s.ProfessionalProfileID.toLowerCase() === match[1].toLowerCase())
        : Array.from(this.store.snapshots.values());
      const attached = existing.map((s) => {
        const data: Record<string, FieldValue> = { ...(s as object as Record<string, FieldValue>) };
        Object.assign(data, {
          Save: async () => {
            this.store.snapshots.set((data.ID as string).toLowerCase(), { ...data } as ReciprocitySnapshotEntity);
            return true;
          },
        });
        return data as object as ReciprocitySnapshotEntity;
      });
      return { Success: true, Results: attached as T[] } as RunViewResult<T>;
    }
    return { Success: true, Results: [] as T[] } as RunViewResult<T>;
  }

  public async RunViews<T>(params: RunViewParams[]): Promise<RunViewResult<T>[]> {
    return Promise.all(params.map((p) => this.RunView<T>(p)));
  }
}

function attachProfileSave(store: MockStore, profile: ProfessionalProfileEntity): ProfessionalProfileEntity {
  const data = profile as object as Record<string, FieldValue>;
  Object.assign(data, {
    Save: async () => {
      store.profiles.set((data.ID as string).toLowerCase(), { ...data } as ProfessionalProfileEntity);
      return true;
    },
  });
  return data as object as ProfessionalProfileEntity;
}

describe('ReciprocityScorecardService.RecomputeSnapshots', () => {
  it('creates a new ReciprocitySnapshot and updates ProfessionalProfile reciprocity/readiness fields when none exists yet', async () => {
    const store: MockStore = {
      profiles: new Map(),
      requests: [],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1, OfferedAt: withinPeriod(1), RespondedAt: null },
      ],
      outcomes: [],
      snapshots: new Map(),
    };
    store.profiles.set(PROFILE_ID.toLowerCase(), attachProfileSave(store, makeProfile(PROFILE_ID)));

    const dp = new MockReciprocityProvider(store);
    const user = { ID: 'u1', Name: 'Test' } as UserInfo;

    const result = await ReciprocityScorecardService.RecomputeSnapshots(user, dp, PERIOD);

    expect(result.ProcessedCount).toBe(1);
    expect(store.snapshots.size).toBe(1);
    const [snapshot] = Array.from(store.snapshots.values());
    expect(snapshot.ReferralsReceived).toBe(1);
    expect(snapshot.ReferralsAccepted).toBe(1);

    const updatedProfile = store.profiles.get(PROFILE_ID.toLowerCase());
    // ReciprocityIndex = round((Sent=0 + 1) / (Accepted=1 + 1), 3) = 0.5
    expect(updatedProfile?.ReciprocityIndex).toBe(0.5);
    expect(updatedProfile?.ReadinessComputedAt).not.toBeNull();
  });

  it('upserts into the existing ReciprocitySnapshot for the same profile/period instead of creating a duplicate', async () => {
    const existingSnapshotData: Record<string, FieldValue> = {
      ID: '30000000-0000-4000-8000-000000000001',
      ProfessionalProfileID: PROFILE_ID,
      PeriodStart: PERIOD.Start,
      PeriodEnd: PERIOD.End,
      ReferralsSent: 0,
      ReferralsReceived: 0,
    };
    const existingSnapshot = existingSnapshotData as ReciprocitySnapshotEntity;
    const store: MockStore = {
      profiles: new Map(),
      requests: [],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Completed', ResponseHours: 3, OfferedAt: withinPeriod(1), RespondedAt: null },
        { ID: 'a2', ReferralRequestID: 'x2', ProfessionalProfileID: PROFILE_ID, Status: 'Completed', ResponseHours: 3, OfferedAt: withinPeriod(2), RespondedAt: null },
      ],
      outcomes: [],
      snapshots: new Map([[existingSnapshot.ID.toLowerCase(), existingSnapshot]]),
    };
    store.profiles.set(PROFILE_ID.toLowerCase(), attachProfileSave(store, makeProfile(PROFILE_ID)));

    const dp = new MockReciprocityProvider(store);
    const user = { ID: 'u1', Name: 'Test' } as UserInfo;

    await ReciprocityScorecardService.RecomputeSnapshots(user, dp, PERIOD);

    expect(store.snapshots.size).toBe(1);
    const [snapshot] = Array.from(store.snapshots.values());
    expect(snapshot.ID).toBe(existingSnapshot.ID);
    expect(snapshot.ReferralsReceived).toBe(2);
  });

  it('is idempotent: running RecomputeSnapshots twice in a row yields the same single snapshot and values', async () => {
    const store: MockStore = {
      profiles: new Map(),
      requests: [],
      assignments: [
        { ID: 'a1', ReferralRequestID: 'x1', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 1, OfferedAt: withinPeriod(1), RespondedAt: null },
        { ID: 'a2', ReferralRequestID: 'x2', ProfessionalProfileID: PROFILE_ID, Status: 'Accepted', ResponseHours: 2, OfferedAt: withinPeriod(2), RespondedAt: null },
      ],
      outcomes: [],
      snapshots: new Map(),
    };
    store.profiles.set(PROFILE_ID.toLowerCase(), attachProfileSave(store, makeProfile(PROFILE_ID)));

    const dp = new MockReciprocityProvider(store);
    const user = { ID: 'u1', Name: 'Test' } as UserInfo;

    const first = await ReciprocityScorecardService.RecomputeSnapshots(user, dp, PERIOD);
    expect(first.ProcessedCount).toBe(1);
    expect(store.snapshots.size).toBe(1);
    const firstSnapshot = Array.from(store.snapshots.values())[0];

    const second = await ReciprocityScorecardService.RecomputeSnapshots(user, dp, PERIOD);
    expect(second.ProcessedCount).toBe(1);
    expect(store.snapshots.size).toBe(1);
    const secondSnapshot = Array.from(store.snapshots.values())[0];

    expect(secondSnapshot.ID).toBe(firstSnapshot.ID);
    expect(secondSnapshot.ReferralsReceived).toBe(firstSnapshot.ReferralsReceived);
    expect(secondSnapshot.ReferralsAccepted).toBe(firstSnapshot.ReferralsAccepted);
  });
});
