import { describe, expect, it } from 'vitest';
import { IMetadataProvider, IRunViewProvider, RunViewParams, RunViewResult, UserInfo } from '@memberjunction/core';
import type {
  ReferralAssignmentEntity,
  ReferralEscalationEntity,
  ReferralRequestEntity,
  ReferralTierEntity,
} from '@mj-biz-apps/referrals-entities';
import { AuthorizationError, InvalidLifecycleStateError, SlaEscalationService } from '../index.js';

const TIER_ID = '10000000-0000-4000-8000-000000000001';
const REQ_1_ID = '20000000-0000-4000-8000-000000000001';
const REQ_2_ID = '20000000-0000-4000-8000-000000000002';
const ASSIGN_1_ID = '30000000-0000-4000-8000-000000000001';
const PERSON_1_ID = '40000000-0000-4000-8000-000000000001';
const COORDINATOR_USER_ID = '50000000-0000-4000-8000-000000000001';
const OUTSIDER_USER_ID = '50000000-0000-4000-8000-000000000099';

type FieldValue = string | number | boolean | Date | null;

function makeUser(roles: string[], id: string = COORDINATOR_USER_ID): UserInfo {
  return new UserInfo(undefined, {
    ID: id,
    Name: 'Test User',
    UserRoles: roles.map((Role) => ({ UserID: id, RoleID: '00000000-0000-0000-0000-000000000001', Role })),
  });
}

function makeTier(overrides: Record<string, FieldValue> = {}): ReferralTierEntity {
  const data: Record<string, FieldValue> = {
    ID: TIER_ID,
    SLAResponseHours: 24,
    EscalationWarningPercent: 75,
    MaxEscalationLevel: 3,
    UrgentSLAMultiplier: 1,
    ...overrides,
  };
  const tier = data as ReferralTierEntity;
  tier.Load = async (id: string) => id.toLowerCase() === TIER_ID.toLowerCase();
  return tier;
}

interface MockStore {
  tiers: Map<string, ReferralTierEntity>;
  requests: Map<string, ReferralRequestEntity>;
  assignments: Map<string, ReferralAssignmentEntity>;
  escalations: Map<string, ReferralEscalationEntity>;
}

function makeEscalation(fields: Record<string, FieldValue>): ReferralEscalationEntity {
  return { ...fields } as ReferralEscalationEntity;
}

function makeRequest(id: string, overrides: Record<string, FieldValue> = {}): ReferralRequestEntity {
  const data: Record<string, FieldValue> = {
    ID: id,
    ReferralTierID: TIER_ID,
    UrgencyLevel: 'Standard',
    Status: 'Routed',
    EscalationLevel: 0,
    LastEscalatedAt: null,
    SubmittedAt: new Date(),
    ...overrides,
  };
  return data as ReferralRequestEntity;
}

function makeAssignment(id: string, requestId: string, overrides: Record<string, FieldValue> = {}): ReferralAssignmentEntity {
  const data: Record<string, FieldValue> = {
    ID: id,
    ReferralRequestID: requestId,
    Status: 'Offered',
    OfferedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
    SLADeadlineAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    SLAWarningSentAt: null,
    ...overrides,
  };
  return data as ReferralAssignmentEntity;
}

let escalationSeq = 1;

class MockEscalationProvider implements IMetadataProvider, IRunViewProvider {
  public Entities: never[] = [];

  constructor(private readonly store: MockStore) {}

  public async GetEntityObject<T>(entityName: string): Promise<T> {
    if (entityName === 'MJ_BizApps_Referrals: Referral Requests') {
      const target = ({} as Record<string, FieldValue>) as ReferralRequestEntity;
      target.Load = async (id: string) => {
        const found = this.store.requests.get(id.toLowerCase());
        if (!found) return false;
        Object.assign(target, found);
        return true;
      };
      target.Save = async () => {
        this.store.requests.set(target.ID.toLowerCase(), { ...target } as ReferralRequestEntity);
        return true;
      };
      return target as object as T;
    }
    if (entityName === 'MJ_BizApps_Referrals: Referral Tiers') {
      const target = ({} as Record<string, FieldValue>) as ReferralTierEntity;
      target.Load = async (id: string) => {
        const found = this.store.tiers.get(id.toLowerCase());
        if (!found) return false;
        Object.assign(target, found);
        return true;
      };
      return target as object as T;
    }
    if (entityName === 'MJ_BizApps_Referrals: Referral Escalations') {
      const newId = `60000000-0000-4000-8000-${String(escalationSeq++).padStart(12, '0')}`;
      const target = ({ ID: newId } as Record<string, FieldValue>) as ReferralEscalationEntity;
      target.Load = async (id: string) => {
        const found = this.store.escalations.get(id.toLowerCase());
        if (!found) return false;
        Object.assign(target, found);
        return true;
      };
      target.Save = async () => {
        this.store.escalations.set(target.ID.toLowerCase(), { ...target } as ReferralEscalationEntity);
        return true;
      };
      return target as object as T;
    }
    throw new Error(`Unexpected entity '${entityName}'`);
  }

  public async RunView<T>(params: RunViewParams): Promise<RunViewResult<T>> {
    const filter = params.ExtraFilter ?? '';
    if (params.EntityName === 'MJ_BizApps_Common: People') {
      return { Success: true, Results: [{ ID: PERSON_1_ID }] as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Assignments') {
      const items = Array.from(this.store.assignments.values())
        .filter((a) => {
          if (filter.includes("Status = 'Offered' AND SLAWarningSentAt IS NULL")) {
            return a.Status === 'Offered' && a.SLAWarningSentAt == null;
          }
          return true;
        })
        .map((a) => {
          const target = ({ ...a } as Record<string, FieldValue>) as ReferralAssignmentEntity;
          target.Save = async () => {
            this.store.assignments.set(target.ID.toLowerCase(), { ...target } as ReferralAssignmentEntity);
            return true;
          };
          return target;
        });
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Tiers') {
      return { Success: true, Results: Array.from(this.store.tiers.values()) as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Requests') {
      const items = Array.from(this.store.requests.values()).filter((r) => {
        if (filter.includes("UrgencyLevel = 'Urgent'")) {
          return r.UrgencyLevel === 'Urgent' && !['Accepted', 'InProgress', 'Completed'].includes(r.Status);
        }
        if (filter.includes('ID IN (')) {
          return filter.toLowerCase().includes(r.ID.toLowerCase());
        }
        return true;
      });
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    if (params.EntityName === 'MJ_BizApps_Referrals: Referral Escalations') {
      const dedupMatch = /DedupKey = '([^']+)'/.exec(filter);
      const reqMatch = /ReferralRequestID = '([^']+)'/i.exec(filter);
      let items = Array.from(this.store.escalations.values());
      if (dedupMatch) {
        // Dedup now checks across ALL statuses, not just Open (CR-13).
        items = items.filter((e) => e.DedupKey === dedupMatch[1]);
      } else if (reqMatch) {
        if (filter.includes("(Status = 'Open' OR Status = 'Acknowledged')")) {
          items = items.filter(
            (e) => e.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase() && (e.Status === 'Open' || e.Status === 'Acknowledged'),
          );
        } else {
          items = items.filter((e) => e.ReferralRequestID.toLowerCase() === reqMatch[1].toLowerCase() && e.Status === 'Open');
        }
      }
      return { Success: true, Results: items as T[] } as RunViewResult<T>;
    }
    return { Success: true, Results: [] as T[] } as RunViewResult<T>;
  }

  public async RunViews<T>(params: RunViewParams[]): Promise<RunViewResult<T>[]> {
    return Promise.all(params.map((p) => this.RunView<T>(p)));
  }
}

describe('SlaEscalationService', () => {
  it('RaiseEscalation creates a new Open escalation, caps EscalationLevel at the tier max, and stamps the request', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier({ MaxEscalationLevel: 2 })]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map(),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const result = await SlaEscalationService.RaiseEscalation(
      {
        ReferralRequestID: REQ_1_ID,
        TriggerType: 'ManualOverride',
        EscalationLevel: 5,
        DedupKey: 'MANUAL:1',
      },
      user,
      dp,
    );

    expect(result.Raised).toBe(true);
    const saved = store.escalations.get(result.ReferralEscalationID.toLowerCase());
    expect(saved?.EscalationLevel).toBe(2);
    expect(saved?.Status).toBe('Open');
    expect(store.requests.get(REQ_1_ID.toLowerCase())?.EscalationLevel).toBe(2);
    expect(store.requests.get(REQ_1_ID.toLowerCase())?.LastEscalatedAt).not.toBeNull();
  });

  it('RaiseEscalation is idempotent by DedupKey: a second call with the same key returns Raised:false and does not duplicate', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier()]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map(),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);
    const input = {
      ReferralRequestID: REQ_1_ID,
      TriggerType: 'SLABreach' as const,
      EscalationLevel: 1,
      DedupKey: 'SLABreach:dup',
    };

    const first = await SlaEscalationService.RaiseEscalation(input, user, dp);
    expect(first.Raised).toBe(true);
    expect(store.escalations.size).toBe(1);

    const second = await SlaEscalationService.RaiseEscalation(input, user, dp);
    expect(second.Raised).toBe(false);
    expect(second.ReferralEscalationID).toBe(first.ReferralEscalationID);
    expect(store.escalations.size).toBe(1);
  });

  it('EvaluateEscalations raises an SLAWarning once the EscalationWarningPercent threshold is crossed and stamps SLAWarningSentAt', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier({ EscalationWarningPercent: 75 })]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map([
        [
          ASSIGN_1_ID.toLowerCase(),
          makeAssignment(ASSIGN_1_ID, REQ_1_ID, {
            OfferedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
            SLADeadlineAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          }),
        ],
      ]),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const result = await SlaEscalationService.EvaluateEscalations(new Date(), user, dp);

    expect(result.WarningsRaised).toBe(1);
    expect(store.escalations.size).toBe(1);
    const [escalation] = Array.from(store.escalations.values());
    expect(escalation.TriggerType).toBe('SLAWarning');
    expect(store.assignments.get(ASSIGN_1_ID.toLowerCase())?.SLAWarningSentAt).not.toBeNull();
  });

  it('EvaluateEscalations raises UrgentUnassigned once an Urgent request exceeds 2x its effective SLA window', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier({ SLAResponseHours: 4, UrgentSLAMultiplier: 1 })]]),
      requests: new Map([
        [
          REQ_2_ID.toLowerCase(),
          makeRequest(REQ_2_ID, {
            UrgencyLevel: 'Urgent',
            Status: 'Routed',
            SubmittedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
          }),
        ],
      ]),
      assignments: new Map(),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const result = await SlaEscalationService.EvaluateEscalations(new Date(), user, dp);

    expect(result.UrgentRaised).toBe(1);
    const [escalation] = Array.from(store.escalations.values());
    expect(escalation.TriggerType).toBe('UrgentUnassigned');
  });

  it('AcknowledgeEscalation requires coordinator/admin authority and makes zero writes when unauthorized', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier()]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map(),
      escalations: new Map([
        [ASSIGN_1_ID.toLowerCase(), makeEscalation({ ID: ASSIGN_1_ID, ReferralRequestID: REQ_1_ID, Status: 'Open', EscalationLevel: 1 })],
      ]),
    };
    const dp = new MockEscalationProvider(store);
    const outsider = makeUser(['Seeker'], OUTSIDER_USER_ID);

    await expect(SlaEscalationService.AcknowledgeEscalation(ASSIGN_1_ID, outsider, dp)).rejects.toThrow(AuthorizationError);
    expect(store.escalations.get(ASSIGN_1_ID.toLowerCase())?.Status).toBe('Open');

    const coordinator = makeUser(['Coordinator']);
    const result = await SlaEscalationService.AcknowledgeEscalation(ASSIGN_1_ID, coordinator, dp, 'Looking into it.');
    expect(result.Status).toBe('Acknowledged');
    expect(store.escalations.get(ASSIGN_1_ID.toLowerCase())?.AcknowledgedByPersonID).toBe(PERSON_1_ID);
  });

  it('ResolveEscalation rejects disallowed transitions and resets request.EscalationLevel to 0 when resolving the last open escalation', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier()]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID, { EscalationLevel: 1 })]]),
      assignments: new Map(),
      escalations: new Map([
        [ASSIGN_1_ID.toLowerCase(), makeEscalation({ ID: ASSIGN_1_ID, ReferralRequestID: REQ_1_ID, Status: 'Resolved', EscalationLevel: 1 })],
      ]),
    };
    const dp = new MockEscalationProvider(store);
    const coordinator = makeUser(['Coordinator']);

    await expect(SlaEscalationService.ResolveEscalation(ASSIGN_1_ID, coordinator, dp)).rejects.toThrow(InvalidLifecycleStateError);

    store.escalations.set(
      ASSIGN_1_ID.toLowerCase(),
      makeEscalation({ ID: ASSIGN_1_ID, ReferralRequestID: REQ_1_ID, Status: 'Open', EscalationLevel: 1 }),
    );

    const result = await SlaEscalationService.ResolveEscalation(ASSIGN_1_ID, coordinator, dp, 'Fixed.');
    expect(result.Status).toBe('Resolved');
    expect(result.RequestEscalationLevelReset).toBe(true);
    expect(store.requests.get(REQ_1_ID.toLowerCase())?.EscalationLevel).toBe(0);
  });

  it('RaiseEscalation deduplicates by DedupKey across ALL statuses (CR-13): a Resolved escalation still blocks a re-raise', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier()]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map(),
      escalations: new Map([
        [ASSIGN_1_ID.toLowerCase(), makeEscalation({ ID: ASSIGN_1_ID, ReferralRequestID: REQ_1_ID, Status: 'Resolved', DedupKey: 'SLABreach:resolved-dup', EscalationLevel: 1 })],
      ]),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const result = await SlaEscalationService.RaiseEscalation(
      { ReferralRequestID: REQ_1_ID, TriggerType: 'SLABreach', EscalationLevel: 1, DedupKey: 'SLABreach:resolved-dup' },
      user,
      dp,
    );
    expect(result.Raised).toBe(false);
    expect(result.ReferralEscalationID).toBe(ASSIGN_1_ID);
    expect(store.escalations.size).toBe(1);
  });

  it('EvaluateEscalations: 0 raised at T0+5h59m, 1 raised (+SLAWarningSentAt) at T0+6h, 0 raised on an immediate repeat call', async () => {
    const offeredAt = new Date('2026-01-01T00:00:00.000Z');
    // 24h tier, 75% warning threshold -> warning fires at 18h elapsed.
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier({ SLAResponseHours: 24, EscalationWarningPercent: 75 })]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID)]]),
      assignments: new Map([
        [
          ASSIGN_1_ID.toLowerCase(),
          makeAssignment(ASSIGN_1_ID, REQ_1_ID, {
            OfferedAt: offeredAt,
            SLADeadlineAt: new Date(offeredAt.getTime() + 24 * 60 * 60 * 1000),
          }),
        ],
      ]),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const beforeThreshold = new Date(offeredAt.getTime() + 17 * 60 * 60 * 1000 + 59 * 60 * 1000);
    const resultBefore = await SlaEscalationService.EvaluateEscalations(beforeThreshold, user, dp);
    expect(resultBefore.WarningsRaised).toBe(0);
    expect(store.escalations.size).toBe(0);

    const atThreshold = new Date(offeredAt.getTime() + 18 * 60 * 60 * 1000);
    const resultAt = await SlaEscalationService.EvaluateEscalations(atThreshold, user, dp);
    expect(resultAt.WarningsRaised).toBe(1);
    expect(store.escalations.size).toBe(1);
    expect(store.assignments.get(ASSIGN_1_ID.toLowerCase())?.SLAWarningSentAt).not.toBeNull();

    const repeatResult = await SlaEscalationService.EvaluateEscalations(atThreshold, user, dp);
    expect(repeatResult.WarningsRaised).toBe(0);
    expect(store.escalations.size).toBe(1);
  });

  it('EvaluateEscalations never raises UrgentUnassigned for a Standard-urgency request, however long it has been unassigned', async () => {
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier({ SLAResponseHours: 4, UrgentSLAMultiplier: 1 })]]),
      requests: new Map([
        [
          REQ_2_ID.toLowerCase(),
          makeRequest(REQ_2_ID, {
            UrgencyLevel: 'Standard',
            Status: 'Routed',
            SubmittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          }),
        ],
      ]),
      assignments: new Map(),
      escalations: new Map(),
    };
    const dp = new MockEscalationProvider(store);
    const user = makeUser(['Coordinator']);

    const result = await SlaEscalationService.EvaluateEscalations(new Date(), user, dp);
    expect(result.UrgentRaised).toBe(0);
    expect(store.escalations.size).toBe(0);
  });

  it('ResolveEscalation/DismissEscalation recompute request.EscalationLevel as the max across remaining Open/Acknowledged escalations (CR-14)', async () => {
    const lowerEscId = ASSIGN_1_ID;
    const higherEscId = '30000000-0000-4000-8000-000000000099';
    const store: MockStore = {
      tiers: new Map([[TIER_ID.toLowerCase(), makeTier()]]),
      requests: new Map([[REQ_1_ID.toLowerCase(), makeRequest(REQ_1_ID, { EscalationLevel: 2 })]]),
      assignments: new Map(),
      escalations: new Map([
        [lowerEscId.toLowerCase(), makeEscalation({ ID: lowerEscId, ReferralRequestID: REQ_1_ID, Status: 'Acknowledged', EscalationLevel: 2 })],
        [higherEscId.toLowerCase(), makeEscalation({ ID: higherEscId, ReferralRequestID: REQ_1_ID, Status: 'Open', EscalationLevel: 1 })],
      ]),
    };
    const dp = new MockEscalationProvider(store);
    const coordinator = makeUser(['Coordinator']);

    // Dismissing the level-1 escalation leaves the level-2 Acknowledged one active, so the
    // request's EscalationLevel must remain 2, not reset to 0.
    const result = await SlaEscalationService.DismissEscalation(higherEscId, coordinator, dp, 'Not needed.');
    expect(result.Status).toBe('Dismissed');
    expect(result.RequestEscalationLevelReset).toBe(false);
    expect(store.requests.get(REQ_1_ID.toLowerCase())?.EscalationLevel).toBe(2);
  });
});
