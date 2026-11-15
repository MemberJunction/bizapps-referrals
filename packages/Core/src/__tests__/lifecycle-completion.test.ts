import { beforeEach, describe, expect, it } from 'vitest';
import { EntityInfo, IMetadataProvider, IRunViewProvider, RunViewParams, RunViewResult, UserInfo } from '@memberjunction/core';
import type {
  ProfessionalProfileEntity,
  ReferralAssignmentEntity,
  ReferralOutcomeEntity,
  ReferralRequestEntity,
} from '@mj-biz-apps/referrals-entities';
import { AuthorizationError, CascadeRoutingService, InvalidLifecycleStateError } from '../index.js';

const ASSIGN_ID = '11111111-1111-4111-8111-111111111111';
const REQUEST_ID = '22222222-2222-4222-8222-222222222222';
const PROFILE_ID = '33333333-3333-4333-8333-333333333333';
const OWNER_USER_ID = '44444444-4444-4444-8444-444444444444';
const OUTSIDER_USER_ID = '55555555-5555-4555-8555-555555555555';

type FieldValue = string | number | boolean | Date | null;

function makeUser(id: string): UserInfo {
  return new UserInfo(undefined, { ID: id, Name: 'Test User', UserRoles: [] });
}

function makeAssignmentRecord(status: string): ReferralAssignmentEntity {
  const data: Record<string, FieldValue> = {
    ID: ASSIGN_ID,
    ReferralRequestID: REQUEST_ID,
    ProfessionalProfileID: PROFILE_ID,
    Status: status,
    OfferedAt: new Date('2026-01-01T00:00:00.000Z'),
    ResponseHours: null,
    CompletedAt: null,
  };
  return data as ReferralAssignmentEntity;
}

function makeRequestRecord(status: string): ReferralRequestEntity {
  const data: Record<string, FieldValue> = {
    ID: REQUEST_ID,
    Status: status,
    CompletedAt: null,
  };
  return data as ReferralRequestEntity;
}

function makeProfileRecord(activeCount: number): ProfessionalProfileEntity {
  const data: Record<string, FieldValue> = {
    ID: PROFILE_ID,
    UserID: OWNER_USER_ID,
    ActiveReferralCount: activeCount,
    TotalCompletedCount: 5,
    AverageResponseHours: null,
  };
  return data as ProfessionalProfileEntity;
}

interface Store {
  assignment: ReferralAssignmentEntity;
  request: ReferralRequestEntity;
  profile: ProfessionalProfileEntity;
  outcomes: Map<string, ReferralOutcomeEntity>;
  saveCount: number;
  // AC-13: other recently-responded assignments for this professional, used by
  // recompute90DayAverageResponseHours's RunView-based 90-day mean query.
  pastAssignments: ReferralAssignmentEntity[];
  // CR-04: when true, the ReferralRequest's final Save() throws, to exercise compensation rollback.
  failRequestSave: boolean;
}

function freshStore(assignmentStatus: string, requestStatus: string, activeCount = 3): Store {
  return {
    assignment: makeAssignmentRecord(assignmentStatus),
    request: makeRequestRecord(requestStatus),
    profile: makeProfileRecord(activeCount),
    outcomes: new Map(),
    saveCount: 0,
    pastAssignments: [],
    failRequestSave: false,
  };
}

class MockLifecycleProvider implements IMetadataProvider, IRunViewProvider {
  public Entities: EntityInfo[] = [];
  private outcomeSeq = 1;

  constructor(private readonly store: Store) {}

  public get LatestResult(): never {
    throw new Error('Not used');
  }

  public async Refresh(): Promise<boolean> {
    return true;
  }

  public EntityByName(name: string): EntityInfo | undefined {
    return this.Entities.find((e) => e.Name === name);
  }

  public async GetEntityObject<T>(entityName: string): Promise<T> {
    if (entityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      const target = this.store.assignment;
      target.Load = async (id: string) => id.toLowerCase() === target.ID.toLowerCase();
      target.Save = async () => {
        this.store.saveCount++;
        return true;
      };
      return target as T;
    }
    if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
      const target = this.store.request;
      target.Load = async (id: string) => id.toLowerCase() === target.ID.toLowerCase();
      target.Save = async () => {
        if (this.store.failRequestSave) {
          throw new Error('Simulated ReferralRequest save failure.');
        }
        this.store.saveCount++;
        return true;
      };
      return target as T;
    }
    if (entityName === 'MJ_BizApps_Referrals: Professional Profiles') {
      const target = this.store.profile;
      target.Load = async (id: string) => id.toLowerCase() === target.ID.toLowerCase();
      target.Save = async () => {
        this.store.saveCount++;
        return true;
      };
      return target as T;
    }
    if (entityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
      const data: Record<string, FieldValue> = {};
      const target = data as ReferralOutcomeEntity;
      target.Save = async () => {
        this.store.saveCount++;
        const id = target.ID ?? `outcome-${this.outcomeSeq++}`;
        target.ID = id;
        this.store.outcomes.set(id, target);
        return true;
      };
      target.Delete = async () => {
        if (target.ID) {
          this.store.outcomes.delete(target.ID);
        }
        return true;
      };
      return target as T;
    }
    throw new Error(`Unexpected entity '${entityName}'`);
  }

  public async RunView<T>(params: RunViewParams): Promise<RunViewResult<T>> {
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Outcomes') {
      const filter = params.ExtraFilter ?? '';
      const items = Array.from(this.store.outcomes.values()).filter(
        (o) => !filter || filter.includes(o.ReferralAssignmentID ?? ''),
      );
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      // Used by recompute90DayAverageResponseHours's 90-day-mean RunView query.
      return { Success: true, Results: this.store.pastAssignments as T[] } as RunViewResult<T>;
    }
    return { Success: true, Results: [] as T[] } as RunViewResult<T>;
  }
}

describe('CascadeRoutingService.MarkInProgress', () => {
  let store: Store;
  beforeEach(() => {
    store = freshStore('Accepted', 'Accepted');
  });

  it('transitions Accepted -> InProgress for the owning professional', async () => {
    const provider = new MockLifecycleProvider(store);
    const result = await CascadeRoutingService.MarkInProgress(ASSIGN_ID, makeUser(OWNER_USER_ID), provider);
    expect(result.AssignmentStatus).toBe('InProgress');
    expect(result.RequestStatus).toBe('InProgress');
    expect(store.assignment.Status).toBe('InProgress');
  });

  it('is idempotent when already InProgress (zero additional writes)', async () => {
    store = freshStore('InProgress', 'InProgress');
    const provider = new MockLifecycleProvider(store);
    const result = await CascadeRoutingService.MarkInProgress(ASSIGN_ID, makeUser(OWNER_USER_ID), provider);
    expect(result.AssignmentStatus).toBe('InProgress');
    expect(store.saveCount).toBe(0);
  });

  it('throws InvalidLifecycleStateError from a non-Accepted status', async () => {
    store = freshStore('Offered', 'Routed');
    const provider = new MockLifecycleProvider(store);
    await expect(CascadeRoutingService.MarkInProgress(ASSIGN_ID, makeUser(OWNER_USER_ID), provider)).rejects.toBeInstanceOf(
      InvalidLifecycleStateError,
    );
    expect(store.saveCount).toBe(0);
  });

  it('throws AuthorizationError for a non-owning, non-admin user with zero writes', async () => {
    const provider = new MockLifecycleProvider(store);
    await expect(CascadeRoutingService.MarkInProgress(ASSIGN_ID, makeUser(OUTSIDER_USER_ID), provider)).rejects.toBeInstanceOf(
      AuthorizationError,
    );
    expect(store.saveCount).toBe(0);
  });
});

describe('CascadeRoutingService.CompleteReferral', () => {
  let store: Store;
  beforeEach(() => {
    store = freshStore('InProgress', 'InProgress', 3);
  });

  it('completes an InProgress assignment: creates ReferralOutcome and updates profile counters', async () => {
    const provider = new MockLifecycleProvider(store);
    const result = await CascadeRoutingService.CompleteReferral(
      { ReferralAssignmentID: ASSIGN_ID, CompletionNotes: 'Great outcome.' },
      makeUser(OWNER_USER_ID),
      provider,
    );
    expect(result.AssignmentStatus).toBe('Completed');
    expect(result.RequestStatus).toBe('Completed');
    expect(result.ReferralOutcomeID).toBeTruthy();
    expect(store.profile.ActiveReferralCount).toBe(2);
    expect(store.profile.TotalCompletedCount).toBe(6);
    expect(store.outcomes.size).toBe(1);
  });

  it('AC-13: recomputes AverageResponseHours as the exact 90-day mean even on a non-SQL (RunView-only) provider', async () => {
    // CR-12: the recompute must run for any provider exposing RunView, not only
    // SQL-capable ones - this mock has no ExecuteSQL at all.
    store.pastAssignments = [
      { ResponseHours: 1 } as ReferralAssignmentEntity,
      { ResponseHours: 2 } as ReferralAssignmentEntity,
      { ResponseHours: 3 } as ReferralAssignmentEntity,
    ];
    const provider = new MockLifecycleProvider(store);
    await CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OWNER_USER_ID), provider);
    // Mean of [1, 2, 3] = 2.00
    expect(store.profile.AverageResponseHours).toBe(2);
  });

  it('CR-04: rolls back the outcome, assignment, and profile counters cleanly when the final ReferralRequest save fails', async () => {
    store.failRequestSave = true;
    const provider = new MockLifecycleProvider(store);
    const originalActiveCount = store.profile.ActiveReferralCount;
    const originalCompletedCount = store.profile.TotalCompletedCount;
    const originalAssignmentStatus = store.assignment.Status;

    await expect(
      CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OWNER_USER_ID), provider),
    ).rejects.toThrow('Simulated ReferralRequest save failure.');

    // Outcome compensation deleted the row created mid-transaction.
    expect(store.outcomes.size).toBe(0);
    // Assignment compensation restored the pre-completion status.
    expect(store.assignment.Status).toBe(originalAssignmentStatus);
    expect(store.assignment.CompletedAt).toBeNull();
    // Profile-counter compensation restored ActiveReferralCount/TotalCompletedCount.
    expect(store.profile.ActiveReferralCount).toBe(originalActiveCount);
    expect(store.profile.TotalCompletedCount).toBe(originalCompletedCount);
  });

  it('never decrements ActiveReferralCount below 0', async () => {
    store = freshStore('Accepted', 'Accepted', 0);
    const provider = new MockLifecycleProvider(store);
    await CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OWNER_USER_ID), provider);
    expect(store.profile.ActiveReferralCount).toBe(0);
  });

  it('throws InvalidLifecycleStateError (zero writes) on a second CompleteReferral call for an already-Completed assignment', async () => {
    store = freshStore('Completed', 'Completed');
    const existingOutcomeData: Record<string, FieldValue> = { ID: 'existing-outcome', ReferralAssignmentID: ASSIGN_ID };
    store.outcomes.set('existing-outcome', existingOutcomeData as ReferralOutcomeEntity);
    const provider = new MockLifecycleProvider(store);
    await expect(
      CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OWNER_USER_ID), provider),
    ).rejects.toBeInstanceOf(InvalidLifecycleStateError);
    expect(store.saveCount).toBe(0);
  });

  it('throws AuthorizationError for a non-owning, non-admin user with zero writes', async () => {
    const provider = new MockLifecycleProvider(store);
    await expect(
      CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OUTSIDER_USER_ID), provider),
    ).rejects.toBeInstanceOf(AuthorizationError);
    expect(store.saveCount).toBe(0);
  });

  it('throws InvalidLifecycleStateError from a Queued/Offered status', async () => {
    store = freshStore('Offered', 'Routed');
    const provider = new MockLifecycleProvider(store);
    await expect(
      CascadeRoutingService.CompleteReferral({ ReferralAssignmentID: ASSIGN_ID }, makeUser(OWNER_USER_ID), provider),
    ).rejects.toBeInstanceOf(InvalidLifecycleStateError);
    expect(store.saveCount).toBe(0);
  });
});
